import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  // common
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { OfficeRepository } from './infrastructure/persistence/office.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Office } from './domain/office';
import { User } from 'src/users/domain/user';
import { Point } from 'geojson';
import { City } from 'src/cities/domain/city';
import { Country } from 'src/countries/domain/country';
import { CitiesService } from '../cities/cities.service';
import { CountriesService } from '../countries/countries.service';
import { CurrenciesService } from '../currencies/currencies.service';
import { NearbyOfficeFilter } from './types';
import { Currency } from '../currencies/domain/currency';
import { OfficeCreatedEvent } from '../events/office-created.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FilesService } from '../files/files.service';
import { FileType } from '../files/domain/file';
import slugify from 'slugify';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';
import { Paginated, PaginateQuery } from 'nestjs-paginate';
import { SearchCitiesWithOfficesDto } from './dto/search-cities-with-offices.dto';
import { FileRepository } from '../files/infrastructure/persistence/file.repository';
import fs from 'fs';
import {
  SearchCitiesWithOfficesResponse,
  CityWithOfficesResponse,
  OfficeStatistics,
  SimplifiedOffice,
  SearchMetadata,
  SearchSummary,
} from './dto/city-with-offices-response.dto';
import { OfficeHoursUtil } from './utils/office-hours.util';

@Injectable()
export class OfficesService {
  private readonly logger = new Logger(OfficesService.name);

  constructor(
    // Dependencies here
    private readonly officeRepository: OfficeRepository,
    private readonly cityService: CitiesService,
    private readonly countryService: CountriesService,
    private readonly currencyService: CurrenciesService,
    private readonly filesService: FilesService,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly fileRepository: FileRepository,
  ) {
    this.logger.log('OfficesService initialized');
  }

  async create(createOfficeDto: CreateOfficeDto) {
    try {
      // Do not remove comment below.
      // <creating-property />

      // Check if location is provided
      if (!createOfficeDto.location) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            location: 'locationRequired',
          },
        });
      }

      // Validate location coordinates format
      if (
        !createOfficeDto.location.coordinates ||
        !Array.isArray(createOfficeDto.location.coordinates) ||
        createOfficeDto.location.coordinates.length !== 2
      ) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            location: 'invalidLocationFormat',
          },
        });
      }

      // Check if owner has office
      if (createOfficeDto.owner) {
        const ownerHasOffice = await this.officeRepository.checkOwnerHasOffice(
          createOfficeDto.owner.id,
        );
        if (ownerHasOffice) {
          throw new ConflictException({
            status: HttpStatus.CONFLICT,
            errors: {
              owner: 'userAlreadyHasOffice',
            },
          });
        }
      }

      const pointObject: Point = {
        type: 'Point',
        coordinates: createOfficeDto.location.coordinates,
      };

      // Find city
      const city = await this.cityService.findById(createOfficeDto.city);
      if (!city) {
        throw new NotFoundException({
          status: HttpStatus.NOT_FOUND,
          errors: {
            city: 'cityNotFound',
          },
        });
      }

      // Get default country
      const country = await this.countryService.getDefaultMorocco();
      if (!country) {
        throw new InternalServerErrorException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          errors: {
            country: 'defaultCountryNotConfigured',
          },
        });
      }

      // Generate slug
      const slug = slugify(createOfficeDto.officeName, { lower: true });

      // Check if office exists using slug
      const officeExistsUsingSlug =
        await this.officeRepository.checkOfficeExistsUsingSlug(slug);
      if (officeExistsUsingSlug) {
        throw new ConflictException({
          status: HttpStatus.CONFLICT,
          errors: {
            officeName: 'officeNameAlreadyExists',
          },
        });
      }

      // Check if office exists using registration number
      if (createOfficeDto.registrationNumber) {
        const officeExistsUsingRegistrationNumber =
          await this.officeRepository.checkOfficeExistsUsingRegistrationNumber(
            createOfficeDto.registrationNumber,
          );
        if (officeExistsUsingRegistrationNumber) {
          throw new ConflictException({
            status: HttpStatus.CONFLICT,
            errors: {
              registrationNumber: 'registrationNumberAlreadyExists',
            },
          });
        }
      }

      // Check if office exists using primary phone number
      if (createOfficeDto.primaryPhoneNumber) {
        const officeExistsUsingPrimaryPhoneNumber =
          await this.officeRepository.checkOfficeExistsUsingPrimaryPhoneNumber(
            createOfficeDto.primaryPhoneNumber,
          );
        if (officeExistsUsingPrimaryPhoneNumber) {
          throw new ConflictException({
            status: HttpStatus.CONFLICT,
            errors: {
              primaryPhoneNumber: 'phoneNumberAlreadyExists',
            },
          });
        }
      }

      // Check if office exists using currency exchange license number
      if (createOfficeDto.currencyExchangeLicenseNumber) {
        const officeExistsUsingCurrencyExchangeLicenseNumber =
          await this.officeRepository.checkOfficeExistsUsingCurrencyExchangeLicenseNumber(
            createOfficeDto.currencyExchangeLicenseNumber,
          );
        if (officeExistsUsingCurrencyExchangeLicenseNumber) {
          throw new ConflictException({
            status: HttpStatus.CONFLICT,
            errors: {
              currencyExchangeLicenseNumber: 'licenseNumberAlreadyExists',
            },
          });
        }
      }

      // Validate logo file exists if provided
      if (createOfficeDto.logo && createOfficeDto.logo.id) {
        const logoFile = await this.filesService.findById(
          createOfficeDto.logo.id,
        );
        if (!logoFile) {
          throw new NotFoundException({
            status: HttpStatus.NOT_FOUND,
            errors: {
              logo: 'logoFileNotFound',
            },
          });
        }
      }

      // Validate mainImage file exists if provided
      if (createOfficeDto.mainImage && createOfficeDto.mainImage.id) {
        const mainImageFile = await this.filesService.findById(
          createOfficeDto.mainImage.id,
        );
        if (!mainImageFile) {
          throw new NotFoundException({
            status: HttpStatus.NOT_FOUND,
            errors: {
              mainImage: 'mainImageFileNotFound',
            },
          });
        }
      }

      // Create office
      const office = await this.officeRepository.create({
        ...createOfficeDto,
        location: pointObject,
        owner: createOfficeDto.owner as User,
        city: city as City,
        country: country as Country,
        // Do not remove comment below.
        // <creating-property-payload />
      });

      // Emit event
      const officeCreatedEvent = new OfficeCreatedEvent(office);
      this.eventEmitter.emit('office.created', officeCreatedEvent);

      return office;
    } catch (error) {
      // Re-throw NestJS exceptions with structured format
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // Handle database constraint violations with structured errors
      if (error?.code === '23505') {
        // PostgreSQL unique constraint violation
        const constraintName = error?.constraint || 'unknown';

        // Map constraint names to user-friendly field names
        const fieldMapping: Record<string, string> = {
          office_slug_unique: 'officeName',
          office_registration_number_unique: 'registrationNumber',
          office_primary_phone_unique: 'primaryPhoneNumber',
          office_license_number_unique: 'currencyExchangeLicenseNumber',
          office_owner_unique: 'owner',
        };

        const field = fieldMapping[constraintName] || 'office';

        throw new ConflictException({
          status: HttpStatus.CONFLICT,
          errors: {
            [field]: 'alreadyExists',
          },
        });
      }

      if (error?.code === '23503') {
        // PostgreSQL foreign key constraint violation
        const constraintName = error?.constraint || 'unknown';

        // Map foreign key constraints to fields
        const fieldMapping: Record<string, string> = {
          office_city_fk: 'city',
          office_country_fk: 'country',
          office_owner_fk: 'owner',
        };

        // Check if it's a logo foreign key constraint (contains logoId)
        if (constraintName && constraintName.includes('logoId')) {
          fieldMapping[constraintName] = 'logo';
        }

        const field = fieldMapping[constraintName] || 'reference';

        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            [field]: 'invalidReference',
          },
        });
      }

      if (error?.code === '23514') {
        // PostgreSQL check constraint violation
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            data: 'violatesBusinessRules',
          },
        });
      }

      if (error?.code === '23502') {
        // PostgreSQL not null constraint violation
        const column = error?.column || 'unknown';
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            [column]: 'fieldRequired',
          },
        });
      }

      // Handle validation errors
      if (
        error?.name === 'ValidationError' ||
        error?.constructor?.name === 'ValidationError'
      ) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            validation: 'invalidDataProvided',
          },
        });
      }

      // Handle timeout errors
      if (error?.name === 'TimeoutError' || error?.code === 'ETIMEDOUT') {
        throw new InternalServerErrorException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          errors: {
            timeout: 'requestTimeout',
          },
        });
      }

      // Handle network/connection errors
      if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
        throw new InternalServerErrorException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          errors: {
            connection: 'serviceUnavailable',
          },
        });
      }

      // Handle file system errors (if any file operations)
      if (error?.code === 'ENOENT') {
        throw new InternalServerErrorException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          errors: {
            file: 'fileNotFound',
          },
        });
      }

      if (error?.code === 'EACCES') {
        throw new InternalServerErrorException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          errors: {
            file: 'fileAccessDenied',
          },
        });
      }

      // Handle memory/resource errors
      if (error?.code === 'ENOMEM') {
        throw new InternalServerErrorException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          errors: {
            resource: 'insufficientMemory',
          },
        });
      }

      // Handle any other unexpected errors without exposing internal details
      console.error('Unexpected error creating office:', error);
      throw new InternalServerErrorException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errors: {
          office: 'creationFailed',
        },
      });
    }
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    const offices = await this.officeRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });

    // Ensure all offices have exactly 5 images
    return offices.map((office) => this.ensureOfficeHasFiveImages(office));
  }

  async findById(id: Office['id']) {
    const office = await this.officeRepository.findById(id);
    if (office) {
      return this.ensureOfficeHasFiveImages(office);
    }
    return office;
  }

  findByIds(ids: Office['id'][]) {
    return this.officeRepository.findByIds(ids);
  }

  findBySlugs(slugs: string[]) {
    return this.officeRepository.findBySlugs(slugs);
  }

  async update(id: Office['id'], updateOfficeDto: UpdateOfficeDto) {
    // Do not remove comment below.
    // <updating-property />

    // Validate that the office exists
    const existingOffice = await this.officeRepository.findById(id);
    if (!existingOffice) {
      throw new NotFoundException('Office not found');
    }

    // Handle location update if provided
    let locationUpdate = {};
    if (updateOfficeDto.location) {
      const pointObject: Point = {
        type: 'Point',
        coordinates: updateOfficeDto.location.coordinates,
      };
      locationUpdate = { location: pointObject };
    }

    // Handle city update if provided
    let cityUpdate = {};
    if (updateOfficeDto.city) {
      const city = await this.cityService.findById(updateOfficeDto.city);
      if (!city) {
        throw new BadRequestException('City not found');
      }
      cityUpdate = { city: city as City };
    }

    // Prepare the update payload by extracting and converting fields properly
    const updatePayload: any = {};

    // Handle basic string fields
    if (updateOfficeDto.officeName !== undefined) {
      updatePayload.officeName = updateOfficeDto.officeName;
    }
    if (updateOfficeDto.registrationNumber !== undefined) {
      updatePayload.registrationNumber = updateOfficeDto.registrationNumber;
    }
    if (updateOfficeDto.currencyExchangeLicenseNumber !== undefined) {
      updatePayload.currencyExchangeLicenseNumber =
        updateOfficeDto.currencyExchangeLicenseNumber;
    }
    if (updateOfficeDto.address !== undefined) {
      updatePayload.address = updateOfficeDto.address;
    }
    if (updateOfficeDto.email !== undefined) {
      updatePayload.email = updateOfficeDto.email;
    }
    // Handle owner field with proper type conversion
    if (updateOfficeDto.owner !== undefined) {
      if (updateOfficeDto.owner === null) {
        updatePayload.owner = null;
      } else {
        // Convert UserDto to User entity
        updatePayload.owner = updateOfficeDto.owner as User;
      }
    }

    if (updateOfficeDto.logo !== undefined) {
      updatePayload.logo = updateOfficeDto.logo;
    }

    if (updateOfficeDto.primaryPhoneNumber !== undefined) {
      updatePayload.primaryPhoneNumber = updateOfficeDto.primaryPhoneNumber;
    }

    if (updateOfficeDto.secondaryPhoneNumber !== undefined) {
      updatePayload.secondaryPhoneNumber = updateOfficeDto.secondaryPhoneNumber;
    }

    if (updateOfficeDto.thirdPhoneNumber !== undefined) {
      updatePayload.thirdPhoneNumber = updateOfficeDto.thirdPhoneNumber;
    }

    if (updateOfficeDto.whatsappNumber !== undefined) {
      updatePayload.whatsappNumber = updateOfficeDto.whatsappNumber;
    }

    if (updateOfficeDto.isActive !== undefined) {
      updatePayload.isActive = updateOfficeDto.isActive;
    }

    // Add location and city updates
    Object.assign(updatePayload, locationUpdate, cityUpdate);

    // Do not remove comment below.
    // <updating-property-payload />

    return this.officeRepository.update(id, updatePayload);
  }

  remove(id: Office['id']) {
    return this.officeRepository.remove(id);
  }

  getUserOffice(owner: User['id']): Promise<Office | null> {
    return this.officeRepository.getUserOffice(owner);
  }

  async getAuthenticatedUserOffice(owner: User['id']): Promise<Office | null> {
    const office =
      await this.officeRepository.getAuthenticatedUserOffice(owner);
    if (office) {
      return this.ensureOfficeHasFiveImages(office);
    }
    return office;
  }

  async updateAuthenticatedUserOffice(
    owner: User['id'],
    updateOfficeDto: UpdateOfficeDto,
  ) {
    const office = await this.officeRepository.getUserOffice(owner);
    if (!office) {
      throw new NotFoundException('Office not found');
    }

    // Handle location update if provided
    let locationUpdate = {};
    if (updateOfficeDto.location) {
      const pointObject: Point = {
        type: 'Point',
        coordinates: updateOfficeDto.location.coordinates,
      };
      locationUpdate = { location: pointObject };
    }

    // Handle city update if provided
    let cityUpdate = {};
    if (updateOfficeDto.city) {
      const city = await this.cityService.findById(updateOfficeDto.city);
      if (!city) {
        throw new BadRequestException('City not found');
      }
      cityUpdate = { city: city as City };
    }

    // Prepare the update payload by extracting and converting fields properly
    const updatePayload: any = {};

    // Handle basic string fields
    if (updateOfficeDto.officeName !== undefined) {
      updatePayload.officeName = updateOfficeDto.officeName;
    }
    if (updateOfficeDto.registrationNumber !== undefined) {
      updatePayload.registrationNumber = updateOfficeDto.registrationNumber;
    }
    if (updateOfficeDto.currencyExchangeLicenseNumber !== undefined) {
      updatePayload.currencyExchangeLicenseNumber =
        updateOfficeDto.currencyExchangeLicenseNumber;
    }
    if (updateOfficeDto.address !== undefined) {
      updatePayload.address = updateOfficeDto.address;
    }
    if (updateOfficeDto.email !== undefined) {
      updatePayload.email = updateOfficeDto.email;
    }

    // Handle owner field with proper type conversion
    if (updateOfficeDto.owner !== undefined) {
      if (updateOfficeDto.owner === null) {
        updatePayload.owner = null;
      } else {
        // Convert UserDto to User entity
        updatePayload.owner = updateOfficeDto.owner as User;
      }
    }

    if (updateOfficeDto.logo !== undefined) {
      updatePayload.logo = updateOfficeDto.logo;
    }

    if (updateOfficeDto.primaryPhoneNumber !== undefined) {
      updatePayload.primaryPhoneNumber = updateOfficeDto.primaryPhoneNumber;
    }

    if (updateOfficeDto.secondaryPhoneNumber !== undefined) {
      updatePayload.secondaryPhoneNumber = updateOfficeDto.secondaryPhoneNumber;
    }

    if (updateOfficeDto.thirdPhoneNumber !== undefined) {
      updatePayload.thirdPhoneNumber = updateOfficeDto.thirdPhoneNumber;
    }

    if (updateOfficeDto.whatsappNumber !== undefined) {
      updatePayload.whatsappNumber = updateOfficeDto.whatsappNumber;
    }

    if (updateOfficeDto.isActive !== undefined) {
      updatePayload.isActive = updateOfficeDto.isActive;
    }

    if (updateOfficeDto.email !== undefined) {
      updatePayload.email = updateOfficeDto.email;
    }

    // Add location and city updates
    Object.assign(updatePayload, locationUpdate, cityUpdate);

    return this.officeRepository.update(office.id, updatePayload);
  }

  async deleteAuthenticatedUserOffice(owner: User['id']): Promise<Office> {
    const office = await this.officeRepository.getUserOffice(owner);
    if (!office) {
      throw new NotFoundException('Office not found');
    }
    await this.officeRepository.remove(office.id);
    return office;
  }

  async findNearbyOffices(
    latitude: number,
    longitude: number,
    radiusInKm: number,
    filter: NearbyOfficeFilter,
    targetCurrencyFromClient?: string,
  ): Promise<{
    offices: Office[];
    officesInPage: number;
    totalOfficesInArea: number;
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
  }> {
    // Validate input parameters
    this.validateNearbyOfficesInput(latitude, longitude, radiusInKm, filter);

    // Get the default MAD currency once and cache it for better performance
    const madCurrency = await this.currencyService.getDefaultBaseCurrencyMAD();
    if (!madCurrency) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        errors: {
          currency: 'defaultMADCurrencyNotFound',
        },
      });
    }

    // Handle currency direction logic
    try {
      const processedFilter = await this.processCurrencyFilter(
        filter,
        madCurrency,
      );

      // Fetch offices using the repository method
      const result = await this.officeRepository.findNearbyOffices(
        latitude,
        longitude,
        radiusInKm,
        processedFilter,
        filter.limit || 9, // Default limit to 9 as requested
        filter.page || 1, // Default page if not provided
      );

      // Ensure all offices have exactly 5 images
      const officesWithImages = result.offices.map((office) =>
        this.ensureOfficeHasFiveImages(office),
      );

      // Filter out offices without equivalentValue before finding the best office
      const validOffices = officesWithImages.filter(
        (office) => office.equivalentValue != null,
      );

      if (validOffices.length === 0) {
        // Return empty result with pagination metadata
        return {
          offices: [],
          officesInPage: 0,
          totalOfficesInArea: result.total,
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          hasMore: result.hasMore,
        };
      }

      // Find the best office based on equivalentValue and rateDirection
      const bestOffice = validOffices.reduce((prev, curr) => {
        // Additional null check as safety measure
        if (prev.equivalentValue == null) return curr;
        if (curr.equivalentValue == null) return prev;

        if (processedFilter.rateDirection === 'BUY') {
          return prev.equivalentValue > curr.equivalentValue ? prev : curr;
        } else {
          return prev.equivalentValue < curr.equivalentValue ? prev : curr;
        }
      });

      const targetCurrency = await this.currencyService.findByCode(
        targetCurrencyFromClient || '',
      );

      // Add bestOffice flag to the response
      const officesWithBestFlag = officesWithImages.map((office) => ({
        ...office,
        bestOffice: office.id === bestOffice.id, // assuming offices have an id field
        targetCurrency: targetCurrency || null,
      }));

      return {
        offices: officesWithBestFlag,
        officesInPage: officesWithBestFlag.length,
        totalOfficesInArea: result.total,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
      };
    } catch (error) {
      console.error(
        `Error finding nearby offices: ${error.message}`,
        error.stack,
      );
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            errors: {
              offices: 'failedToFindNearbyOffices',
            },
          });
    }
  }

  /**
   * Process currency filter and determine rate direction
   */
  private async processCurrencyFilter(
    filter: NearbyOfficeFilter,
    madCurrency: Currency,
  ): Promise<NearbyOfficeFilter> {
    // Create a copy to avoid modifying the original filter
    const processedFilter = { ...filter };

    // Resolve currency codes to IDs if they're not already UUIDs
    if (
      processedFilter.baseCurrencyId &&
      !this.isUUID(processedFilter.baseCurrencyId)
    ) {
      const baseCurrency = await this.currencyService.findByCode(
        processedFilter.baseCurrencyId,
      );
      if (!baseCurrency) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            baseCurrency: `Currency with code '${processedFilter.baseCurrencyId}' not found`,
          },
        });
      }
      processedFilter.baseCurrencyId = baseCurrency.id;
    }

    if (
      processedFilter.targetCurrencyId &&
      !this.isUUID(processedFilter.targetCurrencyId)
    ) {
      const targetCurrency = await this.currencyService.findByCode(
        processedFilter.targetCurrencyId,
      );
      if (!targetCurrency) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            targetCurrency: `Currency with code '${processedFilter.targetCurrencyId}' not found`,
          },
        });
      }
      processedFilter.targetCurrencyId = targetCurrency.id;
    }

    // Determine rate direction based on MAD currency
    if (!processedFilter.baseCurrencyId && !processedFilter.targetCurrencyId) {
      // If no currencies specified, use default behavior (optional)
      processedFilter.baseCurrencyId = madCurrency.id;
    } else if (processedFilter.baseCurrencyId === madCurrency.id) {
      // Client is exchanging MAD for foreign currency → office is SELLING foreign
      processedFilter.rateDirection = 'SELL';
    } else if (processedFilter.targetCurrencyId === madCurrency.id) {
      // Client is exchanging foreign currency for MAD → office is BUYING foreign
      // Swap currencies to maintain consistent direction in repository query
      [processedFilter.baseCurrencyId, processedFilter.targetCurrencyId] = [
        processedFilter.targetCurrencyId,
        processedFilter.baseCurrencyId,
      ];
      processedFilter.rateDirection = 'BUY';
    } else {
      // Handle cross-currency exchange if supported, otherwise throw error
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        errors: {
          currency: 'At least one currency must be MAD for exchange operations',
        },
      });
    }

    return processedFilter;
  }

  /**
   * Validate input parameters for nearby offices search
   */
  private validateNearbyOfficesInput(
    latitude: number,
    longitude: number,
    radiusInKm: number,
    filter: NearbyOfficeFilter,
  ): void {
    // Validate latitude
    if (latitude < -90 || latitude > 90) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        errors: {
          latitude: 'latitudeMustBeBetweenMinus90And90',
        },
      });
    }

    // Validate longitude
    if (longitude < -180 || longitude > 180) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        errors: {
          longitude: 'longitudeMustBeBetweenMinus180And180',
        },
      });
    }

    // Validate radius
    if (radiusInKm <= 0 || radiusInKm > 1000) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        errors: {
          radiusInKm: 'radiusMustBeBetween1And1000Km',
        },
      });
    }

    // Validate filter parameters
    if (
      filter.targetCurrencyRate !== undefined &&
      filter.targetCurrencyRate < 0
    ) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        errors: {
          targetCurrencyRate: 'targetCurrencyRateMustBePositive',
        },
      });
    }

    // No need to validate rateDirection as it will be automatically determined
    // based on which currency is MAD (base or target)
  }

  /**
   * Helper function to check if a string is a valid UUID
   */
  private isUUID(str: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  async attachLogoToOffice(logoId: string, owner: string) {
    const office = await this.officeRepository.getUserOffice(owner);

    if (!office) {
      throw new Error('Office not found');
    }

    console.log('Attaching logo with ID:', logoId);
    const logo = await this.filesService.findById(logoId);

    if (!logo) {
      throw new Error('Logo not found');
    }

    console.log('Found logo:', logo.path);
    office.logo = logo;

    const updatedOffice = await this.officeRepository.update(office.id, office);
    console.log('Updated office logo:', updatedOffice?.logo?.path || 'No logo');

    return updatedOffice;
  }

  async attachImagesToOffice(imageIds: string[], owner: string) {
    const office = await this.officeRepository.getUserOffice(owner);

    if (!office) {
      throw new Error('Office not found');
    }

    console.log('Attaching images with IDs:', imageIds);
    console.log('Current office images:', office.images?.length || 0);

    // Find the images by their IDs
    const images = await this.filesService.findByIds(imageIds);
    console.log('Found images:', images.length);

    if (images.length !== imageIds.length) {
      throw new Error('Some images were not found');
    }

    // Initialize images array if it doesn't exist
    if (!office.images) {
      office.images = [];
    }

    // Add new images to existing ones (avoid duplicates)
    const existingImageIds = office.images.map((img) => img.id);
    const newImages = images.filter(
      (img) => !existingImageIds.includes(img.id),
    );

    console.log('New images to add:', newImages.length);
    office.images = [...office.images, ...newImages];
    console.log('Total images after update:', office.images.length);

    const updatedOffice = await this.officeRepository.update(office.id, office);
    console.log(
      'Updated office images count:',
      updatedOffice?.images?.length || 0,
    );

    return updatedOffice;
  }

  async removeLogoFromOffice(officeId: string) {
    const office = await this.officeRepository.findById(officeId);

    if (!office) {
      throw new Error('Office not found');
    }
    office.logo = null;
    return this.officeRepository.update(officeId, office);
  }

  async markOfficeAsVerified(officeId: string) {
    const office = await this.officeRepository.findById(officeId);
    if (!office) {
      throw new Error('Office not found');
    }
    return this.officeRepository.markOfficeAsVerified(officeId);
  }

  async findByCity(cityId: string): Promise<Office[]> {
    return this.officeRepository.findByCity(cityId);
  }

  /**
   * Enhanced search for cities with comprehensive office information
   * Supports pagination, filtering, sorting, and detailed statistics
   */
  async searchCitiesWithNumberOfOfficeInCity(
    searchDto: SearchCitiesWithOfficesDto,
  ): Promise<SearchCitiesWithOfficesResponse> {
    const startTime = Date.now();

    try {
      this.logger.log(`Searching cities with query: "${searchDto.query}"`);

      // Validate input
      if (!searchDto.query || searchDto.query.trim().length === 0) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            query: 'Search query is required and cannot be empty',
          },
        });
      }

      // Validate pagination parameters
      if (
        searchDto.minOffices !== undefined &&
        searchDto.maxOffices !== undefined
      ) {
        if (searchDto.minOffices > searchDto.maxOffices) {
          throw new BadRequestException({
            status: HttpStatus.BAD_REQUEST,
            errors: {
              offices: 'Minimum offices cannot be greater than maximum offices',
            },
          });
        }
      }

      // Search for cities
      const cities = await this.cityService.searchByName(
        searchDto.query.trim(),
      );
      this.logger.debug(`Found ${cities.length} cities matching query`);

      if (cities.length === 0) {
        return this.createEmptySearchResponse(searchDto, startTime);
      }

      // Process cities with office information
      const citiesWithOffices = await this.processCitiesWithOffices(
        cities,
        searchDto,
      );

      // Apply filters
      const filteredCities = this.applyCityFilters(
        citiesWithOffices,
        searchDto,
      );

      // Apply sorting
      const sortedCities = this.applyCitySorting(filteredCities, searchDto);

      // Apply pagination
      const paginatedResult = this.applyCityPagination(sortedCities, searchDto);

      // Calculate summary statistics
      const summary = this.calculateSearchSummary(
        sortedCities,
        searchDto.query,
        startTime,
      );

      const response: SearchCitiesWithOfficesResponse = {
        data: paginatedResult.data,
        meta: paginatedResult.meta,
        summary,
      };

      const executionTime = Date.now() - startTime;
      this.logger.log(
        `Search completed in ${executionTime}ms. Found ${filteredCities.length} cities, returning ${paginatedResult.data.length} results`,
      );

      return response;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logger.error(
        `Search failed after ${executionTime}ms: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errors: {
          search: 'Failed to search cities with offices',
        },
      });
    }
  }

  async getOfficeBySlug(slug: string): Promise<Office | null> {
    // Normalize the slug to match the format used during creation
    // Use the same slugify logic as in office creation
    const normalizedSlug = slugify(slug, { lower: true });
    try {
      const office =
        await this.officeRepository.getOfficeBySlug(normalizedSlug);
      if (!office) {
        throw new NotFoundException({
          status: HttpStatus.NOT_FOUND,
          errors: {
            office: 'officeNotFound',
          },
        });
      }

      // Ensure office always has exactly 5 images by adding placeholders if needed
      this.ensureOfficeHasFiveImages(office);

      return office;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Helper method to ensure an office has exactly 5 images by adding placeholders if needed
   */
  private ensureOfficeHasFiveImages(office: Office): Office {
    const backendDomain = this.configService.get('app.backendDomain', {
      infer: true,
    });
    const placeholderPath = `${backendDomain}/api/v1/files/place-holder.png`;
    const placeholderOthersPath = `${backendDomain}/api/v1/files/place-holder-others.jpg`;

    if (office.images) {
      const currentImageCount = office.images.length;

      if (currentImageCount === 1) {
        // Special case: if there's exactly 1 image, add 4 "others" placeholders
        for (let i = 0; i < 4; i++) {
          const placeholderFile: FileType = {
            id: randomUUID(),
            path: placeholderOthersPath,
          };
          office.images.push(placeholderFile);
        }
      } else if (currentImageCount < 5) {
        // Normal case: add regular placeholders
        const placeholdersNeeded = 5 - currentImageCount;
        // Create placeholder file objects
        for (let i = 0; i < placeholdersNeeded; i++) {
          const placeholderFile: FileType = {
            id: randomUUID(),
            path: placeholderPath,
          };
          office.images.push(placeholderFile);
        }
      }
    } else {
      // If no images exist, create 5 placeholder images
      office.images = [];
      for (let i = 0; i < 5; i++) {
        const placeholderFile: FileType = {
          id: randomUUID(),
          path: placeholderPath,
        };
        office.images.push(placeholderFile);
      }
    }

    return office;
  }

  async findOfficesByCityName(
    query: PaginateQuery,
    cityName: string,
  ): Promise<Paginated<Office>> {
    return this.officeRepository.findOfficesByCityName(query, cityName);
  }

  /**
   * Find offices by city name with currency conversion support and comprehensive filtering
   */
  async findOfficesByCityNameWithCurrency(
    query: PaginateQuery,
    cityName: string,
    filters?: {
      // Currency conversion parameters
      baseCurrency?: string;
      targetCurrency?: string;
      targetCurrencyRate?: number;
      // Filter parameters
      availableCurrencies?: string[];
      showOnlyOpenNow?: boolean;
      isActive?: boolean;
      isVerified?: boolean;
      isFeatured?: boolean;
      trend?: 'featured' | 'verified' | 'newest';
    },
  ): Promise<Paginated<Office>> {
    // Get the basic paginated result first
    const result = await this.officeRepository.findOfficesByCityName(
      query,
      cityName,
    );

    // Apply basic filters to the offices
    let filteredOffices = result.data;

    if (filters) {
      // Apply trend filter first if specified
      if (filters.trend) {
        switch (filters.trend) {
          case 'featured':
            filteredOffices = filteredOffices.filter(
              (office) => office.isFeatured,
            );
            break;
          case 'verified':
            filteredOffices = filteredOffices.filter(
              (office) => office.isVerified,
            );
            break;
          case 'newest':
            filteredOffices = filteredOffices.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            );
            break;
        }
      }

      // Apply other filters
      filteredOffices = this.applyOfficeFilters(filteredOffices, filters);
    }

    // If no currency parameters provided, return filtered results
    if (
      !filters?.baseCurrency ||
      !filters?.targetCurrency ||
      !filters?.targetCurrencyRate
    ) {
      // Ensure all offices have exactly 5 images
      const officesWithImages = filteredOffices.map((office) =>
        this.ensureOfficeHasFiveImages(office),
      );

      return {
        ...result,
        data: officesWithImages,
      };
    }

    try {
      // Get the default MAD currency
      const madCurrency =
        await this.currencyService.getDefaultBaseCurrencyMAD();
      if (!madCurrency) {
        this.logger.warn(
          'MAD currency not found, skipping currency conversion',
        );
        // Ensure all offices have exactly 5 images before returning
        const officesWithImages = filteredOffices.map((office) =>
          this.ensureOfficeHasFiveImages(office),
        );
        return {
          ...result,
          data: officesWithImages,
        };
      }

      // Process currency filter similar to nearby offices
      const processedFilter = await this.processCurrencyFilterForCity(
        {
          baseCurrencyId: filters.baseCurrency,
          targetCurrencyId: filters.targetCurrency,
          targetCurrencyRate: filters.targetCurrencyRate,
        },
        madCurrency,
      );

      // Apply currency conversion to the filtered offices
      const enhancedOffices = filteredOffices.map((office) => {
        const enhancedOffice = { ...office };

        // Calculate equivalent value if office has matching rates
        if (
          office.rates &&
          processedFilter.baseCurrencyId &&
          processedFilter.targetCurrencyId &&
          processedFilter.targetCurrencyRate
        ) {
          const matchingRate = office.rates.find(
            (rate) =>
              rate?.baseCurrency?.id === processedFilter.baseCurrencyId &&
              rate?.targetCurrency?.id === processedFilter.targetCurrencyId,
          );

          if (matchingRate && processedFilter.rateDirection) {
            const rateValue =
              processedFilter.rateDirection === 'BUY'
                ? matchingRate.buyRate
                : matchingRate.sellRate;

            if (rateValue !== undefined && rateValue > 0) {
              // Calculate equivalent value using the same logic as nearby offices
              // This matches the existing repository implementation
              enhancedOffice.equivalentValue =
                processedFilter.targetCurrencyRate * rateValue;
              this.logger.debug(
                `Calculated equivalent value for office ${office.id}: ${enhancedOffice.equivalentValue}`,
              );
            }
          }
        }

        return enhancedOffice;
      });

      // Ensure all offices have exactly 5 images
      const officesWithImages = enhancedOffices.map((office) =>
        this.ensureOfficeHasFiveImages(office),
      );

      return {
        ...result,
        data: officesWithImages,
      };
    } catch (error) {
      this.logger.error(
        `Error applying currency conversion to city offices: ${error.message}`,
        error.stack,
      );

      // Re-throw validation errors (BadRequestException)
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Return original result without conversion for other errors
      // But still ensure all offices have exactly 5 images
      const officesWithImages = filteredOffices.map((office) =>
        this.ensureOfficeHasFiveImages(office),
      );
      return {
        ...result,
        data: officesWithImages,
      };
    }
  }

  /**
   * Get all offices with search by name and city name using pagination
   */
  async findAllForRateManagement(
    query: PaginateQuery,
    cityName?: string,
  ): Promise<Paginated<Office>> {
    return this.officeRepository.findAllForRateManagement(query, cityName);
  }

  /**
   * Get offices in a specific city with comprehensive information for office listing page
   * This method is designed for pages that show individual offices with rates, images, etc.
   */
  async getOfficesInCity(
    cityName: string,
    filters?: {
      isActive?: boolean;
      isVerified?: boolean;
      isFeatured?: boolean;
      availableCurrencies?: string[];
      showOnlyOpenNow?: boolean;
      sortBy?: 'name' | 'newest' | 'verified' | 'featured' | 'popular';
      sortOrder?: 'ASC' | 'DESC';
      page?: number;
      limit?: number;
      // Currency conversion parameters
      baseCurrency?: string;
      targetCurrency?: string;
      targetCurrencyRate?: number;
      rateDirection?: 'BUY' | 'SELL';
    },
  ): Promise<{
    offices: Office[];
    totalCount: number;
    cityInfo: {
      name: string;
      totalOffices: number;
      activeOffices: number;
      verifiedOffices: number;
      featuredOffices: number;
      availableCurrencies: string[];
    };
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const startTime = Date.now();

    try {
      this.logger.log(`Getting offices for city: ${cityName}`);

      if (!cityName || cityName.trim().length === 0) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            cityName: 'City name is required',
          },
        });
      }

      // Get all offices in the city first
      const allOffices = await this.officeRepository.findOfficesByCityName(
        { page: 1, limit: 1000 } as PaginateQuery, // Get all offices first
        cityName.trim(),
      );

      if (!allOffices.data || allOffices.data.length === 0) {
        return this.createEmptyOfficeListResponse(cityName, filters);
      }

      // Apply filters
      let filteredOffices = this.applyOfficeFilters(allOffices.data, filters);

      // Apply sorting
      filteredOffices = this.applyOfficeSorting(filteredOffices, filters);

      // Calculate city statistics
      const cityInfo = this.calculateCityInfo(cityName, allOffices.data);

      // Apply pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 12; // Default to 12 for grid layout
      const totalCount = filteredOffices.length;
      const totalPages = Math.ceil(totalCount / limit);
      const startIndex = (page - 1) * limit;
      const paginatedOffices = filteredOffices.slice(
        startIndex,
        startIndex + limit,
      );

      // Enhance offices with real-time data and currency conversion
      const enhancedOffices =
        this.enhanceOfficesWithRealTimeData(paginatedOffices);

      // Apply currency conversion if requested
      const officesWithCurrencyConversion = await this.applyCurrencyConversion(
        enhancedOffices,
        filters,
      );

      // Ensure all offices have exactly 5 images
      const officesWithImages = officesWithCurrencyConversion.map((office) =>
        this.ensureOfficeHasFiveImages(office),
      );

      // Add targetCurrency object to each office (same as nearby endpoint)
      const targetCurrency = filters?.targetCurrency
        ? await this.currencyService.findByCode(filters.targetCurrency)
        : null;

      const officesWithTargetCurrency = officesWithImages.map((office) => ({
        ...office,
        targetCurrency: targetCurrency || null,
      }));

      const result = {
        offices: officesWithTargetCurrency,
        totalCount,
        cityInfo,
        pagination: {
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };

      const executionTime = Date.now() - startTime;
      this.logger.log(
        `Retrieved ${enhancedOffices.length} offices for ${cityName} in ${executionTime}ms`,
      );

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logger.error(
        `Failed to get offices for city ${cityName} after ${executionTime}ms: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errors: {
          offices: 'Failed to retrieve offices for city',
        },
      });
    }
  }

  /**
   * Create empty search response when no cities are found
   */
  private createEmptySearchResponse(
    searchDto: SearchCitiesWithOfficesDto,
    startTime: number,
  ): SearchCitiesWithOfficesResponse {
    const executionTime = Date.now() - startTime;

    return {
      data: [],
      meta: {
        page: searchDto.page || 1,
        limit: searchDto.limit || 10,
        totalCities: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      summary: {
        totalOfficesFound: 0,
        totalActiveOffices: 0,
        totalVerifiedOffices: 0,
        searchQuery: searchDto.query,
        executionTimeMs: executionTime,
      },
    };
  }

  /**
   * Process cities with their office information
   */
  private async processCitiesWithOffices(
    cities: City[],
    searchDto: SearchCitiesWithOfficesDto,
  ): Promise<CityWithOfficesResponse[]> {
    this.logger.debug(
      `Processing ${cities.length} cities with office information`,
    );

    const citiesWithOffices = await Promise.all(
      cities.map(async (city) => {
        try {
          // Get all offices for this city
          const offices = await this.officeRepository.findByCity(city.id);

          // Calculate statistics
          const statistics = this.calculateOfficeStatistics(offices);

          // Prepare response object
          const cityResponse: CityWithOfficesResponse = {
            city,
            statistics,
          };

          // Include office details if requested
          if (searchDto.includeOfficeDetails) {
            // Ensure all offices have exactly 5 images
            cityResponse.detailedOffices = offices.map((office) =>
              this.ensureOfficeHasFiveImages(office),
            );
          } else {
            // Include simplified office information
            cityResponse.offices = offices.map((office) =>
              this.mapToSimplifiedOffice(office),
            );
          }

          return cityResponse;
        } catch (error) {
          this.logger.error(
            `Error processing city ${city.id}: ${error.message}`,
            error.stack,
          );

          // Return city with empty statistics on error
          return {
            city,
            statistics: {
              totalOffices: 0,
              activeOffices: 0,
              verifiedOffices: 0,
              featuredOffices: 0,
              availableCurrencies: [],
              currentlyOpenOffices: 0,
            },
            offices: [],
          };
        }
      }),
    );

    return citiesWithOffices;
  }

  /**
   * Calculate comprehensive statistics for offices in a city
   */
  private calculateOfficeStatistics(offices: Office[]): OfficeStatistics {
    const totalOffices = offices.length;
    const activeOffices = offices.filter((office) => office.isActive).length;
    const verifiedOffices = offices.filter(
      (office) => office.isVerified,
    ).length;
    const featuredOffices = offices.filter(
      (office) => office.isFeatured,
    ).length;

    // Get available currencies from office rates
    const availableCurrencies = new Set<string>();
    offices.forEach((office) => {
      if (office.rates) {
        office.rates.forEach((rate) => {
          if (rate.baseCurrency?.code)
            availableCurrencies.add(rate.baseCurrency.code);
          if (rate.targetCurrency?.code)
            availableCurrencies.add(rate.targetCurrency.code);
        });
      }
    });

    // Calculate currently open offices
    let currentlyOpenOffices = 0;
    offices.forEach((office) => {
      if (office.workingHours && office.isActive) {
        try {
          if (OfficeHoursUtil.isOfficeOpen(office.workingHours)) {
            currentlyOpenOffices++;
          }
        } catch (error) {
          this.logger.warn(
            `Error checking working hours for office ${office.id}: ${error.message}`,
          );
        }
      }
    });

    // Find newest office date
    const newestOfficeDate =
      offices.length > 0
        ? new Date(
            Math.max(
              ...offices.map((office) => new Date(office.createdAt).getTime()),
            ),
          )
        : undefined;

    return {
      totalOffices,
      activeOffices,
      verifiedOffices,
      featuredOffices,
      availableCurrencies: Array.from(availableCurrencies).sort(),
      currentlyOpenOffices,
      newestOfficeDate,
    };
  }

  /**
   * Map office to simplified office information
   */
  private mapToSimplifiedOffice(office: Office): SimplifiedOffice {
    const simplified: SimplifiedOffice = {
      id: office.id,
      officeName: office.officeName,
      address: office.address,
      primaryPhoneNumber: office.primaryPhoneNumber,
      slug: office.slug || '',
      isActive: office.isActive,
      isVerified: office.isVerified,
      isFeatured: office.isFeatured,
    };

    // Add logo URL if available
    if (office.logo?.path) {
      simplified.logoUrl = office.logo.path;
    }

    // Check if currently open
    if (office.workingHours && office.isActive) {
      try {
        simplified.isCurrentlyOpen = OfficeHoursUtil.isOfficeOpen(
          office.workingHours,
        );

        // Get today's working hours
        const todayHours = OfficeHoursUtil.getTodayWorkingHours(
          office.workingHours,
        );
        if (todayHours) {
          simplified.todayWorkingHours = `${todayHours.fromTime} - ${todayHours.toTime}`;
        }
      } catch (error) {
        this.logger.warn(
          `Error checking working hours for office ${office.id}: ${error.message}`,
        );
        simplified.isCurrentlyOpen = false;
      }
    }

    return simplified;
  }

  /**
   * Apply filters to cities based on search criteria
   */
  private applyCityFilters(
    cities: CityWithOfficesResponse[],
    searchDto: SearchCitiesWithOfficesDto,
  ): CityWithOfficesResponse[] {
    return cities.filter((cityResponse) => {
      const { statistics } = cityResponse;

      // Filter by minimum offices
      if (
        searchDto.minOffices !== undefined &&
        statistics.totalOffices < searchDto.minOffices
      ) {
        return false;
      }

      // Filter by maximum offices
      if (
        searchDto.maxOffices !== undefined &&
        statistics.totalOffices > searchDto.maxOffices
      ) {
        return false;
      }

      // Filter by active offices only
      if (searchDto.onlyActiveOffices && statistics.activeOffices === 0) {
        return false;
      }

      // Filter by verified offices only
      if (searchDto.onlyVerifiedOffices && statistics.verifiedOffices === 0) {
        return false;
      }

      // Filter by featured offices only
      if (searchDto.onlyFeaturedOffices && statistics.featuredOffices === 0) {
        return false;
      }

      // Filter by available currencies
      if (
        searchDto.availableCurrencies &&
        searchDto.availableCurrencies.length > 0
      ) {
        const hasRequiredCurrencies = searchDto.availableCurrencies.some(
          (currency) =>
            statistics.availableCurrencies.includes(currency.toUpperCase()),
        );
        if (!hasRequiredCurrencies) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Apply sorting to cities based on search criteria
   */
  private applyCitySorting(
    cities: CityWithOfficesResponse[],
    searchDto: SearchCitiesWithOfficesDto,
  ): CityWithOfficesResponse[] {
    const { sortBy = 'officeCount', sortOrder = 'DESC' } = searchDto;

    return cities.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'cityName':
          comparison = a.city.name.localeCompare(b.city.name);
          break;
        case 'officeCount':
          comparison = a.statistics.totalOffices - b.statistics.totalOffices;
          break;
        case 'newestOffice':
          const aDate = a.statistics.newestOfficeDate?.getTime() || 0;
          const bDate = b.statistics.newestOfficeDate?.getTime() || 0;
          comparison = aDate - bDate;
          break;
        case 'mostVerified':
          comparison =
            a.statistics.verifiedOffices - b.statistics.verifiedOffices;
          break;
        case 'mostFeatured':
          comparison =
            a.statistics.featuredOffices - b.statistics.featuredOffices;
          break;
        default:
          comparison = a.statistics.totalOffices - b.statistics.totalOffices;
      }

      return sortOrder === 'ASC' ? comparison : -comparison;
    });
  }

  /**
   * Apply pagination to cities
   */
  private applyCityPagination(
    cities: CityWithOfficesResponse[],
    searchDto: SearchCitiesWithOfficesDto,
  ): {
    data: CityWithOfficesResponse[];
    meta: SearchMetadata;
  } {
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;
    const totalCities = cities.length;
    const totalPages = Math.ceil(totalCities / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedData = cities.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      meta: {
        page,
        limit,
        totalCities,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Calculate summary statistics for the search results
   */
  private calculateSearchSummary(
    cities: CityWithOfficesResponse[],
    searchQuery: string,
    startTime: number,
  ): SearchSummary {
    const totalOfficesFound = cities.reduce(
      (sum, city) => sum + city.statistics.totalOffices,
      0,
    );
    const totalActiveOffices = cities.reduce(
      (sum, city) => sum + city.statistics.activeOffices,
      0,
    );
    const totalVerifiedOffices = cities.reduce(
      (sum, city) => sum + city.statistics.verifiedOffices,
      0,
    );

    return {
      totalOfficesFound,
      totalActiveOffices,
      totalVerifiedOffices,
      searchQuery,
      executionTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use searchCitiesWithNumberOfOfficeInCity with SearchCitiesWithOfficesDto instead
   */
  async searchCitiesWithNumberOfOfficeInCityLegacy(
    query: string,
  ): Promise<
    Array<{ city: City; numberOfOffices: number; offices: Office[] }>
  > {
    this.logger.warn(
      'Using deprecated searchCitiesWithNumberOfOfficeInCityLegacy method',
    );

    if (!query) {
      throw new BadRequestException('query is required');
    }

    const searchDto: SearchCitiesWithOfficesDto = {
      query,
      page: 1,
      limit: 50,
      includeOfficeDetails: true,
      includeStatistics: false,
    };

    const result = await this.searchCitiesWithNumberOfOfficeInCity(searchDto);

    return result.data.map((cityResponse) => ({
      city: cityResponse.city,
      numberOfOffices: cityResponse.statistics.totalOffices,
      offices: (cityResponse.detailedOffices || []).map((office) =>
        this.ensureOfficeHasFiveImages(office),
      ),
    }));
  }

  /**
   * Create empty response for office listing when no offices found
   */
  private createEmptyOfficeListResponse(cityName: string, filters?: any) {
    return {
      offices: [],
      totalCount: 0,
      cityInfo: {
        name: cityName,
        totalOffices: 0,
        activeOffices: 0,
        verifiedOffices: 0,
        featuredOffices: 0,
        availableCurrencies: [],
      },
      pagination: {
        page: filters?.page || 1,
        limit: filters?.limit || 12,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  /**
   * Apply filters to office list
   */
  private applyOfficeFilters(
    offices: Office[],
    filters?: {
      isActive?: boolean;
      isVerified?: boolean;
      isFeatured?: boolean;
      availableCurrencies?: string[];
      showOnlyOpenNow?: boolean;
    },
  ): Office[] {
    if (!filters) return offices;

    return offices.filter((office) => {
      // Filter by active status
      if (
        filters.isActive !== undefined &&
        office.isActive !== filters.isActive
      ) {
        return false;
      }

      // Filter by verified status
      if (
        filters.isVerified !== undefined &&
        office.isVerified !== filters.isVerified
      ) {
        return false;
      }

      // Filter by featured status
      if (
        filters.isFeatured !== undefined &&
        office.isFeatured !== filters.isFeatured
      ) {
        return false;
      }

      // Filter by available currencies
      if (
        filters.availableCurrencies &&
        filters.availableCurrencies.length > 0
      ) {
        const officeCurrencies = new Set<string>();
        if (office.rates) {
          office.rates.forEach((rate) => {
            if (rate.baseCurrency?.code)
              officeCurrencies.add(rate.baseCurrency.code);
            if (rate.targetCurrency?.code)
              officeCurrencies.add(rate.targetCurrency.code);
          });
        }

        const hasRequiredCurrency = filters.availableCurrencies.some(
          (currency) => officeCurrencies.has(currency.toUpperCase()),
        );
        if (!hasRequiredCurrency) {
          return false;
        }
      }

      // Filter by currently open status
      if (filters.showOnlyOpenNow && office.workingHours) {
        try {
          if (!OfficeHoursUtil.isOfficeOpen(office.workingHours)) {
            return false;
          }
        } catch (error) {
          this.logger.warn(
            `Error checking working hours for office ${office.id}: ${error.message}`,
          );
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Apply sorting to office list
   */
  private applyOfficeSorting(
    offices: Office[],
    filters?: {
      sortBy?: 'name' | 'newest' | 'verified' | 'featured' | 'popular';
      sortOrder?: 'ASC' | 'DESC';
    },
  ): Office[] {
    if (!filters?.sortBy) return offices;

    const { sortBy, sortOrder = 'ASC' } = filters;

    return offices.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.officeName.localeCompare(b.officeName);
          break;
        case 'newest':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'verified':
          comparison = (a.isVerified ? 1 : 0) - (b.isVerified ? 1 : 0);
          break;
        case 'featured':
          comparison = (a.isFeatured ? 1 : 0) - (b.isFeatured ? 1 : 0);
          break;
        case 'popular':
          // For now, sort by featured + verified as popularity indicator
          const aScore = (a.isFeatured ? 2 : 0) + (a.isVerified ? 1 : 0);
          const bScore = (b.isFeatured ? 2 : 0) + (b.isVerified ? 1 : 0);
          comparison = aScore - bScore;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'ASC' ? comparison : -comparison;
    });
  }

  /**
   * Calculate city information and statistics
   */
  private calculateCityInfo(
    cityName: string,
    offices: Office[],
  ): {
    name: string;
    totalOffices: number;
    activeOffices: number;
    verifiedOffices: number;
    featuredOffices: number;
    availableCurrencies: string[];
  } {
    const totalOffices = offices.length;
    const activeOffices = offices.filter((office) => office.isActive).length;
    const verifiedOffices = offices.filter(
      (office) => office.isVerified,
    ).length;
    const featuredOffices = offices.filter(
      (office) => office.isFeatured,
    ).length;

    // Get all available currencies
    const currencySet = new Set<string>();
    offices.forEach((office) => {
      if (office.rates) {
        office.rates.forEach((rate) => {
          if (rate.baseCurrency?.code) currencySet.add(rate.baseCurrency.code);
          if (rate.targetCurrency?.code)
            currencySet.add(rate.targetCurrency.code);
        });
      }
    });

    return {
      name: cityName,
      totalOffices,
      activeOffices,
      verifiedOffices,
      featuredOffices,
      availableCurrencies: Array.from(currencySet).sort(),
    };
  }

  /**
   * Enhance offices with real-time data like current open status
   */
  private enhanceOfficesWithRealTimeData(offices: Office[]): Office[] {
    return offices.map((office) => {
      const enhancedOffice = { ...office };

      // Add current open status
      if (office.workingHours) {
        try {
          (enhancedOffice as any).isCurrentlyOpen =
            OfficeHoursUtil.isOfficeOpen(office.workingHours);

          // Add today's working hours
          const todayHours = OfficeHoursUtil.getTodayWorkingHours(
            office.workingHours,
          );
          if (todayHours) {
            (enhancedOffice as any).todayWorkingHours =
              `${todayHours.fromTime} - ${todayHours.toTime}`;
          }
        } catch (error) {
          this.logger.warn(
            `Error checking working hours for office ${office.id}: ${error.message}`,
          );
          (enhancedOffice as any).isCurrentlyOpen = false;
        }
      }

      return enhancedOffice;
    });
  }

  /**
   * Apply currency conversion to offices if currency parameters are provided
   */
  private async applyCurrencyConversion(
    offices: Office[],
    filters?: {
      baseCurrency?: string;
      targetCurrency?: string;
      targetCurrencyRate?: number;
      rateDirection?: 'BUY' | 'SELL';
    },
  ): Promise<Office[]> {
    // If no currency conversion parameters provided, return offices as-is
    if (
      !filters?.baseCurrency ||
      !filters?.targetCurrency ||
      !filters?.targetCurrencyRate
    ) {
      return offices;
    }

    try {
      this.logger.debug(
        `Applying currency conversion: ${filters.baseCurrency} -> ${filters.targetCurrency}, rate: ${filters.targetCurrencyRate}`,
      );

      // Get the default MAD currency
      const madCurrency =
        await this.currencyService.getDefaultBaseCurrencyMAD();
      if (!madCurrency) {
        this.logger.warn(
          'MAD currency not found, skipping currency conversion',
        );
        return offices;
      }

      // Process currency filter similar to nearby offices
      const processedFilter = await this.processCurrencyFilterForCity(
        {
          baseCurrencyId: filters.baseCurrency,
          targetCurrencyId: filters.targetCurrency,
          targetCurrencyRate: filters.targetCurrencyRate,
          rateDirection: filters.rateDirection,
        },
        madCurrency,
      );

      // Apply currency conversion to each office
      return offices.map((office) => {
        const enhancedOffice = { ...office };

        // Calculate equivalent value if office has matching rates
        if (
          office.rates &&
          processedFilter.baseCurrencyId &&
          processedFilter.targetCurrencyId
        ) {
          const matchingRate = office.rates.find(
            (rate) =>
              rate?.baseCurrency?.id === processedFilter.baseCurrencyId &&
              rate?.targetCurrency?.id === processedFilter.targetCurrencyId,
          );

          if (matchingRate && processedFilter.targetCurrencyRate) {
            const rateValue =
              processedFilter.rateDirection === 'BUY'
                ? matchingRate.buyRate
                : matchingRate.sellRate;

            if (rateValue !== undefined && rateValue > 0) {
              // Apply the correct BUY/SELL logic like in nearby office repository
              if (processedFilter.rateDirection === 'BUY') {
                // BUY direction: foreign currency → MAD
                enhancedOffice.equivalentValue =
                  processedFilter.targetCurrencyRate * rateValue;
              } else {
                // SELL direction: MAD → foreign currency
                enhancedOffice.equivalentValue =
                  processedFilter.targetCurrencyRate / rateValue;
              }
              this.logger.debug(
                `Calculated equivalent value for office ${office.id}: ${enhancedOffice.equivalentValue} (direction: ${processedFilter.rateDirection})`,
              );
            }
          }
        }

        return enhancedOffice;
      });
    } catch (error) {
      this.logger.error(
        `Error applying currency conversion: ${error.message}`,
        error.stack,
      );
      // Return offices without conversion on error
      return offices;
    }
  }

  /**
   * Process currency filter for city offices (EXACT same logic as nearby offices)
   */
  private async processCurrencyFilterForCity(
    filter: {
      baseCurrencyId?: string;
      targetCurrencyId?: string;
      targetCurrencyRate?: number;
      rateDirection?: 'BUY' | 'SELL';
    },
    madCurrency: any,
  ): Promise<{
    baseCurrencyId?: string;
    targetCurrencyId?: string;
    targetCurrencyRate?: number;
    rateDirection?: 'BUY' | 'SELL';
  }> {
    const processedFilter = { ...filter };

    // Resolve currency codes to IDs if they're not already UUIDs
    if (
      processedFilter.baseCurrencyId &&
      !this.isUUID(processedFilter.baseCurrencyId)
    ) {
      const baseCurrency = await this.currencyService.findByCode(
        processedFilter.baseCurrencyId,
      );
      if (!baseCurrency) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            baseCurrency: `Currency with code '${processedFilter.baseCurrencyId}' not found`,
          },
        });
      }
      processedFilter.baseCurrencyId = baseCurrency.id;
    }

    if (
      processedFilter.targetCurrencyId &&
      !this.isUUID(processedFilter.targetCurrencyId)
    ) {
      const targetCurrency = await this.currencyService.findByCode(
        processedFilter.targetCurrencyId,
      );
      if (!targetCurrency) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            targetCurrency: `Currency with code '${processedFilter.targetCurrencyId}' not found`,
          },
        });
      }
      processedFilter.targetCurrencyId = targetCurrency.id;
    }

    // EXACT SAME LOGIC AS NEARBY OFFICES: Determine rate direction based on MAD currency
    if (!processedFilter.baseCurrencyId && !processedFilter.targetCurrencyId) {
      // If no currencies specified, use default behavior (optional)
      processedFilter.baseCurrencyId = madCurrency.id;
    } else if (processedFilter.baseCurrencyId === madCurrency.id) {
      // Client is exchanging MAD for foreign currency → office is SELLING foreign
      processedFilter.rateDirection = 'SELL';
    } else if (processedFilter.targetCurrencyId === madCurrency.id) {
      // Client is exchanging foreign currency for MAD → office is BUYING foreign
      // Swap currencies to maintain consistent direction in repository query
      this.logger.debug(
        `Swapping currencies: ${processedFilter.baseCurrencyId} <-> ${processedFilter.targetCurrencyId} for BUY direction`,
      );
      [processedFilter.baseCurrencyId, processedFilter.targetCurrencyId] = [
        processedFilter.targetCurrencyId,
        processedFilter.baseCurrencyId,
      ];
      processedFilter.rateDirection = 'BUY';
    } else {
      // Handle cross-currency exchange if supported, otherwise throw error
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        errors: {
          currency: 'At least one currency must be MAD for exchange operations',
        },
      });
    }

    return processedFilter;
  }

  /**
   * Get count of offices created in a specific time period
   */
  async getOfficesCreatedCount(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return this.officeRepository.getOfficesCreatedCount(startDate, endDate);
  }

  seedOfficeImages() {
    // path of images in the root in folder images next to src
    const pathOfImages = 'images/replace';
    const files = fs.readdirSync(pathOfImages);
    // images count
    let imagesCount = 0;
    let officesFound = 0;
    files.forEach(async (file) => {
      imagesCount++;
      // get slug from file name
      const slug = file.split('.')[0];
      const office = await this.officeRepository.getOfficeBySlug(slug);
      if (office) {
        officesFound++;
        // upload image
        const image = await this.fileRepository.create({
          path: `/${this.configService.get('app.apiPrefix', {
            infer: true,
          })}/v1/files/${file}`,
        });
        // remove attached images from office
        office.images = [];
        // add new image
        office.images.push(image);
        // save office
        await this.officeRepository.update(office.id, office);
      }
    });
    return {
      imagesCount,
      officesFound,
    };
  }
}
