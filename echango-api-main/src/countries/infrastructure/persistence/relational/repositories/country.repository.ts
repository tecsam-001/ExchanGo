import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CountryEntity } from '../entities/country.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Country } from '../../../../domain/country';
import { CountryRepository } from '../../country.repository';
import { CountryMapper } from '../mappers/country.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class CountryRelationalRepository implements CountryRepository {
  constructor(
    @InjectRepository(CountryEntity)
    private readonly countryRepository: Repository<CountryEntity>,
  ) {}

  async create(data: Country): Promise<Country> {
    const persistenceModel = CountryMapper.toPersistence(data);
    const newEntity = await this.countryRepository.save(
      this.countryRepository.create(persistenceModel),
    );
    return CountryMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Country[]> {
    const entities = await this.countryRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => CountryMapper.toDomain(entity));
  }

  async findById(id: Country['id']): Promise<NullableType<Country>> {
    const entity = await this.countryRepository.findOne({
      where: { id },
    });

    return entity ? CountryMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Country['id'][]): Promise<Country[]> {
    const entities = await this.countryRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => CountryMapper.toDomain(entity));
  }

  async update(id: Country['id'], payload: Partial<Country>): Promise<Country> {
    const entity = await this.countryRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.countryRepository.save(
      this.countryRepository.create(
        CountryMapper.toPersistence({
          ...CountryMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return CountryMapper.toDomain(updatedEntity);
  }

  async remove(id: Country['id']): Promise<void> {
    await this.countryRepository.delete(id);
  }

  async getDefaultMorocco(): Promise<Country | null> {
    const entity = await this.countryRepository.findOne({
      where: { alpha2: 'MA' },
    });

    return entity ? CountryMapper.toDomain(entity) : null;
  }
}
