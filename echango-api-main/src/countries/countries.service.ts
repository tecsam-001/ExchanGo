import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { CountryRepository } from './infrastructure/persistence/country.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Country } from './domain/country';

@Injectable()
export class CountriesService {
  constructor(
    // Dependencies here
    private readonly countryRepository: CountryRepository,
  ) {}

  async create(createCountryDto: CreateCountryDto) {
    // Do not remove comment below.
    // <creating-property />

    return this.countryRepository.create({
      ...createCountryDto,
      // Do not remove comment below.
      // <creating-property-payload />
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.countryRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Country['id']) {
    return this.countryRepository.findById(id);
  }

  findByIds(ids: Country['id'][]) {
    return this.countryRepository.findByIds(ids);
  }

  getDefaultMorocco() {
    return this.countryRepository.getDefaultMorocco();
  }

  async update(
    id: Country['id'],

    updateCountryDto: UpdateCountryDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.countryRepository.update(id, {
      ...updateCountryDto,
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: Country['id']) {
    return this.countryRepository.remove(id);
  }
}
