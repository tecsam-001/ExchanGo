import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, QueryFailedError, Between, IsNull } from 'typeorm';
import { OfficeEntity } from '../entities/office.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Office } from '../../../../domain/office';
import { OfficeRepository } from '../../office.repository';
import { OfficeMapper } from '../mappers/office.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { User } from '../../../../../users/domain/user';
import { NearbyOfficeFilter } from '../../../../types';
import { Point } from 'geojson';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { OfficeHoursUtil } from '../../../../utils/office-hours.util';
import {
  officePaginationConfigWithCity,
  officePaginationConfigForRateManagement,
} from '../config/pagination.config';
import slugify from 'slugify';

@Injectable()
export class OfficeRelationalRepository implements OfficeRepository {
  private readonly logger = new Logger(OfficeRelationalRepository.name);

  constructor(
    @InjectRepository(OfficeEntity)
    private readonly officeRepository: Repository<OfficeEntity>,
  ) {
    this.logger.log('OfficeRelationalRepository initialized');
  }

  async create(data: Office): Promise<Office> {
    try {
      this.logger.log(`Creating new office: ${data.officeName}`);

      if (!data.officeName || !data.registrationNumber) {
        throw new BadRequestException(
          'Office name and registration number are required',
        );
      }

      const persistenceModel = OfficeMapper.toPersistence(data);
      const newEntity = await this.officeRepository.save(
        this.officeRepository.create(persistenceModel),
      );

      this.logger.log(`Successfully created office with ID: ${newEntity.id}`);
      return OfficeMapper.toDomain(newEntity);
    } catch (error) {
      this.logger.error(
        `Failed to create office: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof QueryFailedError) {
        if (error.message.includes('duplicate key')) {
          this.logger.error(
            `Duplicate key constraint violation: ${error.message}`,
          );
          this.logger.debug(
            `Error details - driverError: ${JSON.stringify(error.driverError)}`,
          );

          // Check if it's the logo unique constraint (OneToOne relationship creates REL_ constraint)
          // The constraint name pattern for OneToOne relationships is REL_<hash>
          if (error.message.includes('REL_')) {
            throw new BadRequestException({
              status: HttpStatus.CONFLICT,
              errors: {
                logo: 'logoAlreadyInUse',
              },
            });
          }

          // Check for other specific constraints
          if (error.message.includes('office_registration_number')) {
            throw new BadRequestException({
              status: HttpStatus.CONFLICT,
              errors: {
                registrationNumber: 'registrationNumberAlreadyExists',
              },
            });
          }

          if (error.message.includes('office_slug')) {
            throw new BadRequestException({
              status: HttpStatus.CONFLICT,
              errors: {
                officeName: 'officeNameAlreadyExists',
              },
            });
          }

          // Generic duplicate key error
          throw new BadRequestException({
            status: HttpStatus.CONFLICT,
            errors: {
              office: 'duplicateOfficeData',
            },
          });
        }
      }

      throw new InternalServerErrorException('Failed to create office');
    }
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Office[]> {
    try {
      this.logger.log(
        `Finding offices with pagination - Page: ${paginationOptions.page}, Limit: ${paginationOptions.limit}`,
      );

      if (paginationOptions.page < 1 || paginationOptions.limit < 1) {
        throw new BadRequestException(
          'Page and limit must be positive numbers',
        );
      }

      const entities = await this.officeRepository.find({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
      });

      this.logger.log(`Found ${entities.length} offices`);
      return entities.map((entity) => OfficeMapper.toDomain(entity));
    } catch (error) {
      this.logger.error(
        `Failed to find offices with pagination: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to retrieve offices');
    }
  }

  async checkOwnerHasOffice(owner: User['id']): Promise<boolean> {
    try {
      this.logger.log(`Checking if owner ${owner} has an office`);

      if (!owner) {
        throw new BadRequestException('Owner ID is required');
      }

      const office = await this.officeRepository.findOne({
        where: { owner: { id: Number(owner) } },
      });

      const hasOffice = !!office;
      this.logger.log(
        `Owner ${owner} ${hasOffice ? 'has' : 'does not have'} an office`,
      );
      return hasOffice;
    } catch (error) {
      this.logger.error(
        `Failed to check if owner has office: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to check owner office status',
      );
    }
  }

  async findById(id: Office['id']): Promise<NullableType<Office>> {
    try {
      this.logger.log(`Finding office by ID: ${id}`);

      if (!id) {
        throw new BadRequestException('Office ID is required');
      }

      const entity = await this.officeRepository.findOne({
        where: { id },
      });

      if (entity) {
        this.logger.log(`Found office: ${entity.officeName}`);
        return OfficeMapper.toDomain(entity);
      } else {
        this.logger.log(`Office with ID ${id} not found`);
        return null;
      }
    } catch (error) {
      this.logger.error(
        `Failed to find office by ID: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to retrieve office');
    }
  }

  async findByIds(ids: Office['id'][]): Promise<Office[]> {
    try {
      this.logger.log(`Finding offices by IDs: ${ids.join(', ')}`);

      if (!ids || ids.length === 0) {
        this.logger.log('No IDs provided, returning empty array');
        return [];
      }

      const entities = await this.officeRepository.find({
        where: { id: In(ids) },
      });

      this.logger.log(
        `Found ${entities.length} offices out of ${ids.length} requested`,
      );
      return entities.map((entity) => OfficeMapper.toDomain(entity));
    } catch (error) {
      this.logger.error(
        `Failed to find offices by IDs: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to retrieve offices');
    }
  }

  async update(id: Office['id'], payload: Partial<Office>): Promise<Office> {
    try {
      this.logger.log(`Updating office with ID: ${id}`);

      if (!id) {
        throw new BadRequestException('Office ID is required');
      }

      const entity = await this.officeRepository.findOne({
        where: { id },
      });

      if (!entity) {
        this.logger.warn(`Office with ID ${id} not found for update`);
        throw new NotFoundException('Office not found');
      }

      const updatedEntity = await this.officeRepository.save(
        this.officeRepository.create(
          OfficeMapper.toPersistence({
            ...OfficeMapper.toDomain(entity),
            ...payload,
          }),
        ),
      );

      this.logger.log(
        `Successfully updated office: ${updatedEntity.officeName}`,
      );
      return OfficeMapper.toDomain(updatedEntity);
    } catch (error) {
      this.logger.error(
        `Failed to update office: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      if (error instanceof QueryFailedError) {
        if (error.message.includes('duplicate key')) {
          this.logger.error(
            `Duplicate key constraint violation: ${error.message}`,
          );

          // Check if it's the logo unique constraint (OneToOne relationship creates REL_ constraint)
          // The constraint name pattern for OneToOne relationships is REL_<hash>
          if (error.message.includes('REL_')) {
            throw new BadRequestException({
              status: HttpStatus.CONFLICT,
              errors: {
                logo: 'logoAlreadyInUse',
              },
            });
          }

          // Check for other specific constraints
          if (error.message.includes('office_registration_number')) {
            throw new BadRequestException({
              status: HttpStatus.CONFLICT,
              errors: {
                registrationNumber: 'registrationNumberAlreadyExists',
              },
            });
          }

          if (error.message.includes('office_slug')) {
            throw new BadRequestException({
              status: HttpStatus.CONFLICT,
              errors: {
                officeName: 'officeNameAlreadyExists',
              },
            });
          }

          // Generic duplicate key error
          throw new BadRequestException({
            status: HttpStatus.CONFLICT,
            errors: {
              office: 'duplicateOfficeData',
            },
          });
        }
      }

      throw new InternalServerErrorException('Failed to update office');
    }
  }

  async remove(id: Office['id']): Promise<void> {
    try {
      this.logger.log(`Removing office with ID: ${id}`);

      if (!id) {
        throw new BadRequestException('Office ID is required');
      }

      const result = await this.officeRepository.delete(id);

      if (result.affected === 0) {
        this.logger.warn(`Office with ID ${id} not found for deletion`);
        throw new NotFoundException('Office not found');
      }

      this.logger.log(`Successfully removed office with ID: ${id}`);
    } catch (error) {
      this.logger.error(
        `Failed to remove office: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to remove office');
    }
  }

  async getUserOffice(owner: User['id']): Promise<Office | null> {
    try {
      this.logger.log(`Getting office for user: ${owner}`);

      if (!owner) {
        throw new BadRequestException('Owner ID is required');
      }

      const entity = await this.officeRepository.findOne({
        where: { owner: { id: Number(owner) } },
      });

      if (entity) {
        this.logger.log(`Found office for user ${owner}: ${entity.officeName}`);
        return OfficeMapper.toDomain(entity);
      } else {
        this.logger.log(`No office found for user: ${owner}`);
        return null;
      }
    } catch (error) {
      this.logger.error(
        `Failed to get user office: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to retrieve user office');
    }
  }

  async getAuthenticatedUserOffice(owner: User['id']): Promise<Office | null> {
    try {
      this.logger.log(`Getting authenticated user office for user: ${owner}`);

      if (!owner) {
        throw new BadRequestException('Owner ID is required');
      }

      const entity = await this.officeRepository
        .createQueryBuilder('office')
        .leftJoinAndSelect('office.owner', 'owner')
        .leftJoinAndSelect('office.logo', 'logo')
        .leftJoinAndSelect('office.mainImage', 'mainImage')
        .leftJoinAndSelect('office.city', 'city')
        .leftJoinAndSelect('office.country', 'country')
        .leftJoinAndSelect('office.workingHours', 'workingHour')
        .leftJoinAndSelect('office.faqs', 'faq')
        .leftJoinAndSelect('office.images', 'image')
        .where('office.owner.id = :ownerId', { ownerId: Number(owner) })
        .getOne();

      if (entity) {
        this.logger.log(
          `Found authenticated user office: ${entity.officeName}`,
        );
        return OfficeMapper.toDomain(entity);
      } else {
        this.logger.log(`No office found for authenticated user: ${owner}`);
        return null;
      }
    } catch (error) {
      this.logger.error(
        `Failed to get authenticated user office: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to retrieve authenticated user office',
      );
    }
  }

  async findNearbyOffices(
    latitude: number,
    longitude: number,
    radiusInKm: number,
    filter: NearbyOfficeFilter,
    limit: number = 9,
    page: number = 1,
  ): Promise<{
    offices: Office[];
    total: number;
    hasMore: boolean;
    currentPage: number;
    totalPages: number;
  }> {
    const startTime = Date.now();
    try {
      this.logger.log(
        `Finding nearby offices - Lat: ${latitude}, Lng: ${longitude}, Radius: ${radiusInKm}km, Limit: ${limit}, Page: ${page}`,
      );

      // Validate input parameters
      if (!latitude || !longitude || !radiusInKm) {
        throw new BadRequestException(
          'Latitude, longitude, and radius are required',
        );
      }

      if (latitude < -90 || latitude > 90) {
        throw new BadRequestException('Latitude must be between -90 and 90');
      }

      if (longitude < -180 || longitude > 180) {
        throw new BadRequestException('Longitude must be between -180 and 180');
      }

      if (radiusInKm <= 0 || radiusInKm > 1000) {
        throw new BadRequestException('Radius must be between 0 and 1000 km');
      }

      // Validate pagination parameters
      if (limit <= 0 || limit > 100) {
        throw new BadRequestException('Limit must be between 1 and 100');
      }

      if (page <= 0) {
        throw new BadRequestException('Page must be greater than 0');
      }

      // Create a point geometry from the provided coordinates
      const point: Point = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };

      this.logger.debug(`Applied filters: ${JSON.stringify(filter)}`);

      // Build query using joins to get all the data in one go
      this.logger.debug('Building spatial query with comprehensive joins');
      const query = this.officeRepository
        .createQueryBuilder('office')
        .leftJoinAndSelect('office.owner', 'owner')
        .leftJoinAndSelect('office.logo', 'logo')
        .leftJoinAndSelect('office.images', 'images')
        .leftJoinAndSelect('office.city', 'city')
        .leftJoinAndSelect('office.country', 'country')
        // Explicitly join with rates table
        .leftJoinAndSelect('office.rates', 'rate')
        .leftJoinAndSelect('rate.baseCurrency', 'baseCurrency')
        .leftJoinAndSelect('rate.targetCurrency', 'targetCurrency')
        .leftJoinAndSelect('office.workingHours', 'workingHours')
        // Basic office filters - only apply when explicitly requested
        .where('1 = 1') // Always true condition to start the where clause
        // Distance calculation and filter
        .addSelect(
          `ST_DistanceSphere(
          office.location,
          ST_SetSRID(ST_GeomFromGeoJSON(:point), 4326)
        ) / 1000`,
          'distance',
        )
        .andWhere(
          `ST_DistanceSphere(
          office.location,
          ST_SetSRID(ST_GeomFromGeoJSON(:point), 4326)
        ) <= :radius`,
          {
            point: JSON.stringify(point),
            radius: radiusInKm * 1000, // Convert to meters
          },
        );

      // Apply currency filters if provided
      if (filter.baseCurrencyId && filter.baseCurrencyId.trim() !== '') {
        this.logger.debug(
          `Applying base currency filter: ${filter.baseCurrencyId}`,
        );
        query.andWhere('baseCurrency.id = :baseCurrencyId', {
          baseCurrencyId: filter.baseCurrencyId,
        });
      }

      if (filter.targetCurrencyId && filter.targetCurrencyId.trim() !== '') {
        this.logger.debug(
          `Applying target currency filter: ${filter.targetCurrencyId}`,
        );
        query.andWhere('targetCurrency.id = :targetCurrencyId', {
          targetCurrencyId: filter.targetCurrencyId,
        });
      }

      // Handle rate filtering with proper validation
      // if (
      //   filter.targetCurrencyRate !== undefined &&
      //   filter.targetCurrencyRate > 0 &&
      //   filter.rateDirection
      // ) {
      //   if (filter.targetCurrencyRate < 0) {
      //     throw new BadRequestException(
      //       'Target currency rate must be positive',
      //     );
      //   }

      //   this.logger.debug(
      //     `Applying rate filter: ${filter.rateDirection} >= ${filter.targetCurrencyRate}`,
      //   );
      //   const rateColumn =
      //     filter.rateDirection === 'BUY' ? 'rate.buyRate' : 'rate.sellRate';
      //   query.andWhere(`${rateColumn} >= :rate`, {
      //     rate: filter.targetCurrencyRate,
      //   });
      // }

      // Handle available currencies filter - this should filter offices that have rates for these currencies
      if (filter.availableCurrencies && filter.availableCurrencies.length > 0) {
        // Filter out empty strings and ensure we have valid currency IDs
        const validCurrencyIds = filter.availableCurrencies.filter(
          (id) => id && id.trim() !== '',
        );
        if (validCurrencyIds.length > 0) {
          this.logger.debug(
            `Applying available currencies filter: ${validCurrencyIds.join(', ')}`,
          );
          query.andWhere('targetCurrency.id IN (:...currencyIds)', {
            currencyIds: validCurrencyIds,
          });
        }
      }

      // Handle office status filters - only apply when explicitly requested
      if (filter.isActive !== undefined) {
        this.logger.debug(`Applying active status filter: ${filter.isActive}`);
        query.andWhere('office.isActive = :isActive', {
          isActive: filter.isActive,
        });
      }

      if (filter.isVerified !== undefined) {
        this.logger.debug(
          `Applying verified status filter: ${filter.isVerified}`,
        );
        query.andWhere('office.isVerified = :isVerified', {
          isVerified: filter.isVerified,
        });
      }

      // Handle featured filter
      if (filter.isFeatured !== undefined) {
        this.logger.debug(`Applying featured filter: ${filter.isFeatured}`);
        query.andWhere('office.isFeatured = :isFeatured', {
          isFeatured: filter.isFeatured,
        });
      }

      // Handle sorting based on filter preferences
      if (filter.nearest) {
        this.logger.debug('Applying nearest sorting');
        query.orderBy('distance', 'ASC');
      } else if (filter.isPopular) {
        this.logger.debug('Applying popular sorting');
        // For popular offices, we'll sort by a combination of factors
        // This is a simplified approach - in production you might want more sophisticated scoring
        query
          .addSelect('office.createdAt', 'office_created_at')
          .orderBy('office.isFeatured', 'DESC')
          .addOrderBy('office.isVerified', 'DESC')
          .addOrderBy('office.createdAt', 'ASC'); // Older offices might be more established
      } else if (filter.mostSearched) {
        this.logger.debug('Applying most searched sorting');
        // For most searched, we'll need to join with analytics data
        // For now, we'll use a proxy metric (featured + verified offices first)
        query
          .orderBy('office.isFeatured', 'DESC')
          .addOrderBy('office.isVerified', 'DESC')
          .addOrderBy('office.createdAt', 'DESC'); // Newer offices might be trending
      } else {
        this.logger.debug('Applying default distance sorting');
        // Default sorting by distance
        query.orderBy('distance', 'ASC');
      }

      // Get total count before applying pagination
      this.logger.debug('Getting total count');
      const countQuery = query.clone();
      const total = await countQuery.getCount();

      // Apply pagination
      const skip = (page - 1) * limit;
      query.skip(skip).take(limit);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);
      const hasMore = page < totalPages;

      // Log the SQL for debugging in development
      this.logger.debug(`Generated SQL: ${query.getSql()}`);

      // Get results with raw distances
      this.logger.debug('Executing spatial query');
      const queryStartTime = Date.now();
      const [rawResults, entities] = await Promise.all([
        query.getRawMany(),
        query.getMany(),
      ]);
      const queryDuration = Date.now() - queryStartTime;
      this.logger.debug(
        `Query executed in ${queryDuration}ms, found ${entities.length} offices out of ${total} total`,
      );

      // Create a map to store distances by office ID
      const distanceMap = new Map<string, number>();

      // Extract distances from raw results
      rawResults.forEach((raw) => {
        const officeId = raw.office_id;
        if (!distanceMap.has(officeId)) {
          const distance = parseFloat(raw.distance);
          if (isNaN(distance)) {
            this.logger.warn(
              `Invalid distance value for office ${officeId}: ${raw.distance}`,
            );
            distanceMap.set(officeId, 0);
          } else {
            distanceMap.set(officeId, distance);
          }
        }
      });

      // Map entities to domain models with added distance and apply post-query filters
      this.logger.debug('Mapping entities to domain models');
      let mappedOffices = entities.map((office) => {
        try {
          const domainOffice = OfficeMapper.toDomain(office);
          // Add distance to the domain model
          domainOffice.distanceInKm = distanceMap.get(office.id) || 0;

          // Calculate equivalent value
          if (
            filter.targetCurrencyRate &&
            filter.baseCurrencyId &&
            filter.targetCurrencyId
          ) {
            const rate = office.rates.find((rate) => {
              return (
                rate?.baseCurrency?.id === filter.baseCurrencyId &&
                rate?.targetCurrency?.id === filter.targetCurrencyId
              );
            });

            if (rate) {
              let equivalentValue = 0;

              if (filter.rateDirection === 'BUY') {
                // EUR → MAD AND ROUND TO TWO DECIMALS
                equivalentValue =
                  Math.round(filter.targetCurrencyRate * rate.buyRate * 100) /
                  100;
              } else {
                // MAD → EUR
                equivalentValue =
                  Math.round(
                    (filter.targetCurrencyRate / rate.sellRate) * 100,
                  ) / 100;
              }

              domainOffice.equivalentValue = equivalentValue;
              this.logger.debug(
                `Calculated equivalent value for office ${office.id}: ${equivalentValue}`,
              );
            }
          }

          // Add today's working hours for convenience
          if (domainOffice.workingHours) {
            const todayHours = OfficeHoursUtil.getTodayWorkingHours(
              domainOffice.workingHours,
            );
            domainOffice.todayWorkingHours = todayHours || undefined;
          }

          return domainOffice;
        } catch (mappingError) {
          this.logger.error(
            `Failed to map office ${office.id}: ${mappingError.message}`,
            mappingError.stack,
          );
          throw new InternalServerErrorException(
            `Failed to process office data for office ${office.id}`,
          );
        }
      });

      // Apply post-query filters that require complex logic
      // Note: This filtering happens after pagination, which might not be ideal
      // For better performance, consider moving this logic to the database query if possible
      if (filter.showOnlyOpenNow) {
        this.logger.debug('Applying open-now filter');
        const beforeFilterCount = mappedOffices.length;
        mappedOffices = mappedOffices.filter((office) => {
          try {
            return office.workingHours
              ? OfficeHoursUtil.isOfficeOpen(office.workingHours)
              : false;
          } catch (hoursError) {
            this.logger.warn(
              `Failed to check working hours for office ${office.id}: ${hoursError.message}`,
            );
            return false;
          }
        });
        this.logger.debug(
          `Open-now filter reduced results from ${beforeFilterCount} to ${mappedOffices.length}`,
        );
      }

      const totalDuration = Date.now() - startTime;
      this.logger.log(
        `Successfully found ${mappedOffices.length} nearby offices (page ${page}/${totalPages}) in ${totalDuration}ms`,
      );

      return {
        offices: mappedOffices,
        total,
        hasMore,
        currentPage: page,
        totalPages,
      };
    } catch (error) {
      const totalDuration = Date.now() - startTime;
      this.logger.error(
        `Error in findNearbyOffices after ${totalDuration}ms: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      if (error instanceof QueryFailedError) {
        this.logger.error(
          `Database query failed: ${error.message}`,
          error.stack,
        );
        throw new InternalServerErrorException(
          'Database query failed while finding nearby offices',
        );
      }

      throw new InternalServerErrorException('Failed to find nearby offices');
    }
  }

  async markOfficeAsVerified(officeId: string): Promise<Office> {
    try {
      this.logger.log(`Marking office as verified: ${officeId}`);

      if (!officeId) {
        throw new BadRequestException('Office ID is required');
      }

      const office = await this.officeRepository
        .createQueryBuilder('office')
        .update({ isVerified: true })
        .where('office.id = :officeId', { officeId })
        .returning('*')
        .execute();

      if (!office.raw || office.raw.length === 0) {
        this.logger.warn(
          `Office with ID ${officeId} not found for verification`,
        );
        throw new NotFoundException('Office not found');
      }

      this.logger.log(`Successfully marked office ${officeId} as verified`);
      return OfficeMapper.toDomain(office.raw[0]);
    } catch (error) {
      this.logger.error(
        `Failed to mark office as verified: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to mark office as verified',
      );
    }
  }

  async checkOfficeExistsUsingRegistrationNumber(
    registrationNumber: string,
  ): Promise<boolean> {
    try {
      this.logger.debug(
        `Checking if office exists with registration number: ${registrationNumber}`,
      );

      if (!registrationNumber || registrationNumber.trim() === '') {
        throw new BadRequestException('Registration number is required');
      }

      const office = await this.officeRepository.findOne({
        where: { registrationNumber: registrationNumber.trim() },
      });

      const exists = !!office;
      this.logger.debug(
        `Office with registration number ${registrationNumber} ${exists ? 'exists' : 'does not exist'}`,
      );
      return exists;
    } catch (error) {
      this.logger.error(
        `Failed to check office by registration number: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to check office existence',
      );
    }
  }

  async checkOfficeExistsUsingPrimaryPhoneNumber(
    primaryPhoneNumber: string,
  ): Promise<boolean> {
    try {
      this.logger.debug(
        `Checking if office exists with phone number: ${primaryPhoneNumber}`,
      );

      if (!primaryPhoneNumber || primaryPhoneNumber.trim() === '') {
        throw new BadRequestException('Primary phone number is required');
      }

      const office = await this.officeRepository.findOne({
        where: { primaryPhoneNumber: primaryPhoneNumber.trim() },
      });

      const exists = !!office;
      this.logger.debug(
        `Office with phone number ${primaryPhoneNumber} ${exists ? 'exists' : 'does not exist'}`,
      );
      return exists;
    } catch (error) {
      this.logger.error(
        `Failed to check office by phone number: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to check office existence',
      );
    }
  }

  async checkOfficeExistsUsingCurrencyExchangeLicenseNumber(
    currencyExchangeLicenseNumber: string,
  ): Promise<boolean> {
    try {
      this.logger.debug(
        `Checking if office exists with license number: ${currencyExchangeLicenseNumber}`,
      );

      if (
        !currencyExchangeLicenseNumber ||
        currencyExchangeLicenseNumber.trim() === ''
      ) {
        throw new BadRequestException(
          'Currency exchange license number is required',
        );
      }

      const office = await this.officeRepository.findOne({
        where: {
          currencyExchangeLicenseNumber: currencyExchangeLicenseNumber.trim(),
        },
      });

      const exists = !!office;
      this.logger.debug(
        `Office with license number ${currencyExchangeLicenseNumber} ${exists ? 'exists' : 'does not exist'}`,
      );
      return exists;
    } catch (error) {
      this.logger.error(
        `Failed to check office by license number: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to check office existence',
      );
    }
  }

  async checkOfficeExistsUsingSlug(slug: string): Promise<boolean> {
    try {
      this.logger.debug(`Checking if office exists with slug: ${slug}`);

      if (!slug || slug.trim() === '') {
        throw new BadRequestException('Slug is required');
      }

      const office = await this.officeRepository.findOne({
        where: { slug: slug.trim() },
      });

      const exists = !!office;
      this.logger.debug(
        `Office with slug ${slug} ${exists ? 'exists' : 'does not exist'}`,
      );
      return exists;
    } catch (error) {
      this.logger.error(
        `Failed to check office by slug: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to check office existence',
      );
    }
  }

  async findByCity(cityId: string): Promise<Office[]> {
    try {
      this.logger.log(`Finding offices by city ID: ${cityId}`);

      if (!cityId || cityId.trim() === '') {
        throw new BadRequestException('City ID is required');
      }

      const offices = await this.officeRepository.find({
        where: { city: { id: cityId.trim() } },
        select: {
          officeName: true,
          id: true,
        },
      });

      this.logger.log(`Found ${offices.length} offices in city ${cityId}`);
      return offices.map((office) => OfficeMapper.toDomain(office));
    } catch (error) {
      this.logger.error(
        `Failed to find offices by city: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to retrieve offices by city',
      );
    }
  }

  async findOfficesByCityName(
    query: PaginateQuery,
    cityName: string,
  ): Promise<Paginated<Office>> {
    try {
      this.logger.log(`Finding offices by city name: ${cityName}`);

      if (!cityName || cityName.trim() === '') {
        throw new BadRequestException('City name is required');
      }

      const result = await paginate(
        query,
        this.officeRepository,
        officePaginationConfigWithCity(cityName.trim()),
      );

      this.logger.log(
        `Found ${result.data.length} offices in city ${cityName}`,
      );
      return {
        data: result.data.map((office) => OfficeMapper.toDomain(office)),
        meta: result.meta as Paginated<Office>['meta'],
        links: result.links,
      };
    } catch (error) {
      this.logger.error(
        `Failed to find offices by city name: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to retrieve offices by city name',
      );
    }
  }

  async getOfficeBySlug(slug: string): Promise<Office | null> {
    try {
      this.logger.log(`Getting office by slug: ${slug}`);

      if (!slug || slug.trim() === '') {
        throw new BadRequestException('Slug is required');
      }

      const office = await this.officeRepository.findOne({
        where: { slug: slug.trim() },
        relations: {
          owner: true,
          logo: true,
          mainImage: true,
          city: true,
          country: true,
          rates: true,
          workingHours: true,
          faqs: true,
          images: true,
        },
      });

      if (office) {
        this.logger.log(`Found office by slug ${slug}: ${office.officeName}`);
        return OfficeMapper.toDomain(office);
      } else {
        this.logger.log(`No office found with slug: ${slug}`);
        return null;
      }
    } catch (error) {
      this.logger.error(
        `Failed to get office by slug: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to retrieve office by slug',
      );
    }
  }

  async getOfficesCreatedCount(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    try {
      const count = await this.officeRepository.count({
        where: {
          createdAt: Between(startDate, endDate),
          deletedAt: IsNull(),
        },
      });

      return count;
    } catch (error) {
      this.logger.error(
        `Failed to get offices created count: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve offices created count',
      );
    }
  }

  async findBySlugs(slugs: string[]): Promise<Office[]> {
    try {
      this.logger.log(`Finding offices by slugs: ${slugs.join(', ')}`);

      if (!slugs || slugs.length === 0) {
        this.logger.log('No slugs provided, returning empty array');
        return [];
      }

      // Normalize slugs to match the format used during creation
      const normalizedSlugs = slugs.map((slug) =>
        slugify(slug, { lower: true }),
      );

      const entities = await this.officeRepository.find({
        where: { slug: In(normalizedSlugs) },
        relations: {
          rates: {
            baseCurrency: true,
            targetCurrency: true,
          },
        },
      });

      this.logger.log(
        `Found ${entities.length} offices out of ${slugs.length} requested slugs`,
      );
      return entities.map((entity) => OfficeMapper.toDomain(entity));
    } catch (error) {
      this.logger.error(
        `Failed to find offices by slugs: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve offices by slugs',
      );
    }
  }

  async findAllForRateManagement(
    query: PaginateQuery,
    cityName?: string, // Made optional
  ): Promise<Paginated<Office>> {
    try {
      this.logger.log(
        `Finding offices for rate management${cityName ? ` with city: ${cityName}` : ''}`,
      );

      const result = await paginate(
        query,
        this.officeRepository,
        officePaginationConfigForRateManagement(cityName),
      );

      this.logger.log(
        `Found ${result.data.length} offices for rate management`,
      );

      return {
        data: result.data.map((office) => OfficeMapper.toDomain(office)),
        meta: result.meta as Paginated<Office>['meta'],
        links: result.links,
      };
    } catch (error) {
      this.logger.error(
        `Failed to find offices for rate management: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to retrieve offices for rate management',
      );
    }
  }
}
