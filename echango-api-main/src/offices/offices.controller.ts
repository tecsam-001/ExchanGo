import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { OfficesService } from './offices.service';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { FindNearbyOfficesDto } from './dto/find-nearby-offices.dto';
import { AttachLogoDto } from './dto/attach-logo.dto';
import { AttachImagesDto } from './dto/attach-images.dto';
import { SearchOfficesByCityDto } from './dto/search-offices-by-city.dto';
import { NearbyOfficesResponseDto } from './dto/nearby-offices-response.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Office } from './domain/office';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllOfficesDto } from './dto/find-all-offices.dto';
import { NearbyOfficeFilter } from './types';
import { PaginatedSwaggerDocs, PaginateQuery } from 'nestjs-paginate';
import { officePaginationConfig } from './infrastructure/persistence/relational/config/pagination.config';
import { SearchCitiesWithOfficesDto } from './dto/search-cities-with-offices.dto';
import { SearchCitiesWithOfficesResponse } from './dto/city-with-offices-response.dto';

@ApiTags('Offices')
@Controller({
  path: 'offices',
  version: '1',
})
export class OfficesController {
  constructor(private readonly officesService: OfficesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiCreatedResponse({
    type: Office,
  })
  create(@Body() createOfficeDto: CreateOfficeDto, @Request() req: any) {
    return this.officesService.create({
      ...createOfficeDto,
      owner: req.user,
    });
  }

  @Get()
  // @ApiBearerAuth()
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(RoleEnum.admin)
  @ApiOkResponse({
    type: InfinityPaginationResponse(Office),
  })
  async findAll(
    @Query() query: FindAllOfficesDto,
  ): Promise<InfinityPaginationResponseDto<Office>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.officesService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @Get('/seed-images')
  @ApiOkResponse({
    type: String,
  })
  seedOfficeImages() {
    return this.officesService.seedOfficeImages();
  }

  @Get('/owned')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({
    type: Office,
  })
  async getOwnedOffice(@Request() req: any) {
    return this.officesService.getAuthenticatedUserOffice(req.user.id);
  }

  @Patch('/owned')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({
    type: Office,
  })
  async updateOwnedOffice(
    @Body() updateOfficeDto: UpdateOfficeDto,
    @Request() req: any,
  ) {
    return this.officesService.updateAuthenticatedUserOffice(
      req.user.id,
      updateOfficeDto,
    );
  }

  @Delete('/owned')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({
    type: Office,
  })
  async deleteOwnedOffice(@Request() req: any) {
    return this.officesService.deleteAuthenticatedUserOffice(req.user.id);
  }

  @Get('nearby')
  @ApiOkResponse({
    type: NearbyOfficesResponseDto,
    description: 'Paginated nearby offices with metadata',
  })
  async findNearbyOffices(
    @Query() query: FindNearbyOfficesDto,
  ): Promise<NearbyOfficesResponseDto> {
    const filter: NearbyOfficeFilter = {
      baseCurrencyId: query.baseCurrency ?? '',
      targetCurrencyId: query.targetCurrency ?? '',
      targetCurrencyRate: query.targetCurrencyRate ?? 1,
      //rateDirection is automatically determined based on which currency is MAD
      isOpen: query.isOpen ?? true,
      availableCurrencies: query.availableCurrencies ?? [],
      isPopular: query.isPopular ?? false,
      mostSearched: query.mostSearched ?? false,
      nearest: query.nearest ?? false,
      isFeatured: query.isFeatured,
      isVerified: query.isVerified,
      isActive: query.isActive,
      showOnlyOpenNow: query.showOnlyOpenNow ?? false,
      limit: query.limit ?? 9, // Default limit if not provided
      page: query.page ?? 1, // Default page if not provided
    };

    console.log('filters from controller', filter);

    return this.officesService.findNearbyOffices(
      query.latitude,
      query.longitude,
      query.radiusInKm,
      filter,
      query.targetCurrency,
    );
  }

  @Get('search-by-city')
  @UseGuards(AuthGuard('anonymous'))
  @ApiOkResponse({
    type: SearchCitiesWithOfficesResponse,
    description: 'Enhanced search results for cities with office information',
  })
  async searchCitiesWithNumberOfOfficeInCity(
    @Query() searchDto: SearchCitiesWithOfficesDto,
  ): Promise<SearchCitiesWithOfficesResponse> {
    return this.officesService.searchCitiesWithNumberOfOfficeInCity(searchDto);
  }

  @Get('search-by-city-legacy')
  @UseGuards(AuthGuard('anonymous'))
  @ApiOkResponse({
    type: [Office],
    description: 'Legacy search endpoint for backward compatibility',
  })
  async searchCitiesWithNumberOfOfficeInCityLegacy(
    @Query('query') query: string,
  ) {
    return this.officesService.searchCitiesWithNumberOfOfficeInCityLegacy(
      query,
    );
  }

  @Get('city/:cityName')
  @UseGuards(AuthGuard('anonymous'))
  @ApiOkResponse({
    description:
      'Get offices in a specific city with comprehensive information and currency conversion support',
    schema: {
      type: 'object',
      properties: {
        offices: {
          type: 'array',
          items: {
            allOf: [
              { $ref: '#/components/schemas/Office' },
              {
                type: 'object',
                properties: {
                  equivalentValue: {
                    type: 'number',
                    description:
                      'Calculated equivalent value based on exchange rate and target currency rate',
                    example: 1050.0,
                  },
                  isCurrentlyOpen: {
                    type: 'boolean',
                    description:
                      'Whether the office is currently open based on working hours',
                    example: true,
                  },
                  todayWorkingHours: {
                    type: 'string',
                    description:
                      "Today's working hours in format HH:MM - HH:MM",
                    example: '09:00 - 17:00',
                  },
                },
              },
            ],
          },
        },
        totalCount: {
          type: 'number',
          description: 'Total number of offices after filtering',
        },
        cityInfo: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'City name' },
            totalOffices: {
              type: 'number',
              description: 'Total offices in city',
            },
            activeOffices: {
              type: 'number',
              description: 'Number of active offices',
            },
            verifiedOffices: {
              type: 'number',
              description: 'Number of verified offices',
            },
            featuredOffices: {
              type: 'number',
              description: 'Number of featured offices',
            },
            availableCurrencies: {
              type: 'array',
              items: { type: 'string' },
              description: 'All currencies available in this city',
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', description: 'Current page number' },
            limit: { type: 'number', description: 'Items per page' },
            totalPages: {
              type: 'number',
              description: 'Total number of pages',
            },
            hasNextPage: {
              type: 'boolean',
              description: 'Whether there are more pages',
            },
            hasPreviousPage: {
              type: 'boolean',
              description: 'Whether there are previous pages',
            },
          },
        },
      },
    },
  })
  async getOfficesInCity(
    @Param('cityName') cityName: string,
    @Query('isActive') isActive?: boolean,
    @Query('isVerified') isVerified?: boolean,
    @Query('isFeatured') isFeatured?: boolean,
    @Query('availableCurrencies') availableCurrencies?: string,
    @Query('showOnlyOpenNow') showOnlyOpenNow?: boolean,
    @Query('sortBy')
    sortBy?: 'name' | 'newest' | 'verified' | 'featured' | 'popular',
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    // Currency conversion parameters
    @Query('baseCurrency') baseCurrency?: string,
    @Query('targetCurrency') targetCurrency?: string,
    @Query('targetCurrencyRate') targetCurrencyRate?: number,
    @Query('rateDirection') rateDirection?: 'BUY' | 'SELL',
  ) {
    const filters = {
      isActive: isActive !== undefined ? isActive : undefined,
      isVerified: isVerified !== undefined ? isVerified : undefined,
      isFeatured: isFeatured !== undefined ? isFeatured : undefined,
      availableCurrencies: availableCurrencies
        ? availableCurrencies.split(',').map((c) => c.trim())
        : undefined,
      showOnlyOpenNow:
        showOnlyOpenNow !== undefined ? showOnlyOpenNow : undefined,
      sortBy,
      sortOrder,
      page: page || 1,
      limit: limit || 12,
      // Currency conversion parameters
      baseCurrency,
      targetCurrency,
      targetCurrencyRate: targetCurrencyRate
        ? Number(targetCurrencyRate)
        : undefined,
      rateDirection,
    };

    return this.officesService.getOfficesInCity(cityName, filters);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Office,
  })
  findById(@Param('id') id: string) {
    return this.officesService.findById(id);
  }

  @Get('/slug/:slug')
  @UseGuards(AuthGuard('anonymous'))
  @ApiOkResponse({
    type: Office,
  })
  @ApiParam({
    name: 'slug',
    type: String,
    required: true,
  })
  findBySlug(@Param('slug') slug: string) {
    return this.officesService.getOfficeBySlug(slug);
  }

  @Get('/city/:cityName')
  @PaginatedSwaggerDocs(Office, officePaginationConfig)
  @UseGuards(AuthGuard('anonymous'))
  @ApiOkResponse({
    type: [Office],
    description:
      'Search offices by city name with comprehensive filtering and currency conversion support',
  })
  @ApiParam({
    name: 'cityName',
    type: String,
    required: true,
    description: 'Name of the city to search offices in',
    example: 'Casablanca',
  })
  async searchOfficesByCityName(
    @Query() query: PaginateQuery,
    @Param('cityName') cityName: string,
    @Query() searchDto: SearchOfficesByCityDto,
  ) {
    // Merge pagination query with search filters
    const filters = {
      baseCurrency: searchDto.baseCurrency,
      targetCurrency: searchDto.targetCurrency,
      targetCurrencyRate: searchDto.targetCurrencyRate,
      availableCurrencies: searchDto.availableCurrencies,
      showOnlyOpenNow: searchDto.showOnlyOpenNow,
      isActive: searchDto.isActive,
      isVerified: searchDto.isVerified,
      isFeatured: searchDto.isFeatured,
      trend: searchDto.trend,
    };

    return this.officesService.findOfficesByCityNameWithCurrency(
      query,
      cityName,
      filters,
    );
  }

  @Get('/rate-management/search')
  @PaginatedSwaggerDocs(Office, officePaginationConfig)
  @UseGuards(AuthGuard('anonymous'))
  @ApiOkResponse({
    type: [Office],
    description:
      'Find all offices for rate management with comprehensive filtering and currency conversion support',
  })
  @ApiParam({
    name: 'cityName',
    type: String,
    required: true,
    description: 'Name of the city to find offices in',
    example: 'Casablanca',
  })
  async findAllForRateManagement(
    @Query() query: PaginateQuery,
    @Query('cityName') cityName?: string,
  ) {
    return this.officesService.findAllForRateManagement(query, cityName);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Office,
  })
  update(@Param('id') id: string, @Body() updateOfficeDto: UpdateOfficeDto) {
    return this.officesService.update(id, updateOfficeDto);
  }

  @Post('/logo')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Office,
  })
  attachLogoToOffice(
    @Body() attachLogoDto: AttachLogoDto,
    @Request() req: any,
  ) {
    return this.officesService.attachLogoToOffice(
      attachLogoDto.logo.file.id,
      req.user.id,
    );
  }

  @Post('/images')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({
    type: Office,
  })
  attachImagesToOffice(
    @Body() attachImagesDto: AttachImagesDto,
    @Request() req: any,
  ) {
    return this.officesService.attachImagesToOffice(
      attachImagesDto.images.map((imageResponse) => imageResponse.file.id),
      req.user.id,
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.officesService.remove(id);
  }
}
