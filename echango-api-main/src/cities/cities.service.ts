import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { CityRepository } from './infrastructure/persistence/city.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { City } from './domain/city';
import { CountriesService } from '../countries/countries.service';

@Injectable()
export class CitiesService {
  constructor(
    // Dependencies here
    private readonly cityRepository: CityRepository,
    private readonly countriesService: CountriesService,
  ) {}

  async create(createCityDto: CreateCityDto) {
    // Do not remove comment below.
    // <creating-property />

    const country = await this.countriesService.findById(
      createCityDto.country.id,
    );
    if (!country) {
      throw new Error('Country not found');
    }

    return this.cityRepository.create({
      ...createCityDto,
      country,
      // Do not remove comment below.
      // <creating-property-payload />
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.cityRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: City['id']) {
    return this.cityRepository.findById(id);
  }

  findByIds(ids: City['id'][]) {
    return this.cityRepository.findByIds(ids);
  }

  async update(
    id: City['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateCityDto: UpdateCityDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.cityRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: City['id']) {
    return this.cityRepository.remove(id);
  }

  async searchByName(name: string): Promise<City[]> {
    return this.cityRepository.searchByName(name);
  }

  async searchByNameWithOffices(name: string): Promise<City[]> {
    return this.cityRepository.searchByNameWithOffices(name);
  }

  async getAllOrSearch(name?: string): Promise<City[]> {
    if (name) {
      return this.cityRepository.searchByName(name);
    }
    return this.cityRepository.findAllWithPagination({
      paginationOptions: {
        page: 1,
        limit: 200,
      },
    });
  }
}
