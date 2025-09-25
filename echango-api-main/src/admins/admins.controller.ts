import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AdminsService } from './admins.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiQuery,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CitiesService } from '../cities/cities.service';
import { AboutOfficesDto } from './dto/about-offices.dto';
import { AboutOfficesResponse } from './dto/about-offices-response.dto';

@ApiTags('Admins')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'admins',
  version: '1',
})
export class AdminsController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly citiesService: CitiesService,
  ) {}

  @Get('analytics/stats')
  async getAnalyticsStats(
    @Query('period') period: '7days' | '30days' | '90days' = '7days',
  ) {
    return this.adminsService.getDashboardSummary(period);
  }

  @Get('activity/stats')
  async getActivityStatistics(
    @Query('period') period?: '7days' | '30days' | '90days',
  ) {
    return this.adminsService.getActivityStatistics(period || '7days');
  }

  @Get('activity/list')
  async getOfficeActivityList(
    @Query('period') period?: '7days' | '30days' | '90days',
    @Query('cityId') cityId?: string,
    @Query('countryId') countryId?: string,
    @Query('isActiveOnly') isActiveOnly?: boolean,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.adminsService.getOfficeActivityList({
      period: period || '7days',
      cityId,
      countryId,
      isActiveOnly,
      limit,
      offset,
    });
  }

  @Get('dashboard/stats')
  async getDashboardStats(
    @Query('period') period: '7days' | '30days' | '90days' = '7days',
  ) {
    return this.adminsService.getDashboardStats(period);
  }

  @Get('dashboard/table')
  async getDashboardTable(
    @Query('period') period?: '7days' | '30days' | '90days',
    @Query('cityId') cityId?: string,
    @Query('countryId') countryId?: string,
    @Query('isActiveOnly') isActiveOnly?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    // Convert and validate query parameters
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const pageSize = limit
      ? Math.max(1, Math.min(100, parseInt(limit, 10)))
      : 10;
    const offset = (pageNumber - 1) * pageSize;

    // Convert isActiveOnly string to boolean
    const isActiveOnlyBoolean = isActiveOnly === 'true';

    const result = await this.adminsService.getDashboardTable({
      period: period || '7days',
      cityId,
      countryId,
      isActiveOnly: isActiveOnlyBoolean,
      limit: pageSize,
      offset,
      search,
    });

    // Add pagination metadata to response
    const totalPages = Math.ceil(result.totalOffices / pageSize);

    return {
      ...result,
      pagination: {
        currentPage: pageNumber,
        pageSize,
        totalPages,
        totalItems: result.totalOffices,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    };
  }

  @Get('office-engagement')
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['7days', '30days', '90days'],
    description:
      'Time period for engagement data (Last 7 days, Last 30 days, Last 90 days)',
    example: '7days',
  })
  @ApiQuery({
    name: 'cityIds',
    required: false,
    type: String,
    description:
      'Comma-separated list of city IDs to filter by (supports multiple city selection)',
    example: 'city1,city2,city3',
  })
  @ApiQuery({
    name: 'cityId',
    required: false,
    type: String,
    description: 'Single city ID for backward compatibility',
    example: 'city1',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by office name or city name',
    example: 'Casablanca',
  })
  @ApiQuery({
    name: 'isActiveOnly',
    required: false,
    type: Boolean,
    description: 'Filter to show only active offices',
    example: true,
  })
  async getOfficeEngagement(
    @Query('period') period?: '7days' | '30days' | '90days',
    @Query('cityId') cityId?: string, // Keep for backward compatibility
    @Query('cityIds') cityIds?: string, // New parameter for multiple cities
    @Query('countryId') countryId?: string,
    @Query('isActiveOnly') isActiveOnly?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    // Convert page-based pagination to offset-based for service layer
    const pageNumber = page && page > 0 ? page : 1;
    const pageSize = limit && limit > 0 ? limit : 10;
    const offset = (pageNumber - 1) * pageSize;

    // Process multiple city IDs
    let processedCityIds: string[] | undefined;
    if (cityIds) {
      processedCityIds = cityIds
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0);
    } else if (cityId) {
      // Backward compatibility: single cityId
      processedCityIds = [cityId];
    }

    const result = await this.adminsService.getOfficeEngagement({
      period: period || '7days',
      cityId, // Keep for backward compatibility
      cityIds: processedCityIds,
      countryId,
      isActiveOnly,
      limit: pageSize,
      offset,
      search,
    });

    // Add pagination metadata to response
    const totalPages = Math.ceil(result.totalOffices / pageSize);

    return {
      ...result,
      pagination: {
        currentPage: pageNumber,
        pageSize,
        totalPages,
        totalItems: result.totalOffices,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    };
  }

  @Get('filters/cities')
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search cities by name',
  })
  async getCitiesForFilter(@Query('search') search?: string) {
    if (search) {
      // Search cities by name
      const cities = await this.citiesService.searchByName(search);
      return {
        data: cities.map((city) => ({
          id: city.id,
          name: city.name,
          country: city.country?.name,
        })),
        total: cities.length,
      };
    } else {
      // Get all cities with pagination
      const cities = await this.citiesService.findAllWithPagination({
        paginationOptions: { page: 1, limit: 100 }, // Get first 100 cities
      });
      return {
        data: cities.map((city) => ({
          id: city.id,
          name: city.name,
          country: city.country?.name,
        })),
        total: cities.length,
      };
    }
  }

  @Get('about-offices')
  @ApiOkResponse({
    type: AboutOfficesResponse,
    description:
      'Get comprehensive office information with filtering capabilities',
  })
  @ApiQuery({
    name: 'countryId',
    required: false,
    type: String,
    description: 'Filter by country ID',
  })
  @ApiQuery({
    name: 'cityIds',
    required: false,
    type: String,
    description: 'Filter by multiple city IDs (comma-separated)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['REQUESTED', 'ON_HOLD', 'ACCEPTED', 'REJECTED'],
    description: 'Filter by office status',
  })
  @ApiQuery({
    name: 'duration',
    required: false,
    enum: ['ALL_TIME', 'LAST_7_DAYS', 'LAST_1_MONTH', 'LAST_6_MONTHS'],
    description: 'Filter by duration on platform',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term for office name or city',
  })
  async getAboutOffices(
    @Query() query: AboutOfficesDto,
  ): Promise<AboutOfficesResponse> {
    return this.adminsService.getAboutOffices(query);
  }
}
