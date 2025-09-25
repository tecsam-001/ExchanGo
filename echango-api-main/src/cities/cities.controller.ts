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
} from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { City } from './domain/city';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllCitiesDto } from './dto/find-all-cities.dto';

@ApiTags('Cities')
@Controller({
  path: 'cities',
  version: '1',
})
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  @ApiCreatedResponse({
    type: City,
  })
  create(@Body() createCityDto: CreateCityDto) {
    return this.citiesService.create(createCityDto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(City),
  })
  async findAll(
    @Query() query: FindAllCitiesDto,
  ): Promise<InfinityPaginationResponseDto<City>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.citiesService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @Get('search')
  @ApiOkResponse({
    type: InfinityPaginationResponse(City),
  })
  @UseGuards(AuthGuard('anonymous'))
  async searchByName(
    @Query('name') name: string,
    @Query() query: FindAllCitiesDto,
  ): Promise<InfinityPaginationResponseDto<City>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.citiesService.searchByNameWithOffices(name),
      {
        page,
        limit,
      },
    );
  }

  @Get('all-or-search')
  @ApiOkResponse({
    type: InfinityPaginationResponse(City),
  })
  @UseGuards(AuthGuard('anonymous'))
  async getAllOrSearch(
    @Query() query: FindAllCitiesDto,
    @Query('name') name?: string,
  ): Promise<InfinityPaginationResponseDto<City>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(await this.citiesService.getAllOrSearch(name), {
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: City,
  })
  findById(@Param('id') id: string) {
    return this.citiesService.findById(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: City,
  })
  update(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto) {
    return this.citiesService.update(id, updateCityDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.citiesService.remove(id);
  }
}
