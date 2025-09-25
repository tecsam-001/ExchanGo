import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { CurrencyEntity } from '../entities/currency.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Currency } from '../../../../domain/currency';
import { CurrencyRepository } from '../../currency.repository';
import { CurrencyMapper } from '../mappers/currency.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class CurrencyRelationalRepository implements CurrencyRepository {
  constructor(
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepository: Repository<CurrencyEntity>,
  ) {}

  async create(data: Currency): Promise<Currency> {
    const persistenceModel = CurrencyMapper.toPersistence(data);
    const newEntity = await this.currencyRepository.save(
      this.currencyRepository.create(persistenceModel),
    );
    return CurrencyMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Currency[]> {
    const entities = await this.currencyRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => CurrencyMapper.toDomain(entity));
  }

  async findById(id: Currency['id']): Promise<NullableType<Currency>> {
    const entity = await this.currencyRepository.findOne({
      where: { id },
    });

    return entity ? CurrencyMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Currency['id'][]): Promise<Currency[]> {
    const entities = await this.currencyRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => CurrencyMapper.toDomain(entity));
  }

  async findByCode(code: Currency['code']): Promise<NullableType<Currency>> {
    const entity = await this.currencyRepository.findOne({
      where: { code },
    });

    return entity ? CurrencyMapper.toDomain(entity) : null;
  }

  async searchByCode(query: string): Promise<Currency[]> {
    const entities = await this.currencyRepository.find({
      where: { code: Like(`%${query.toUpperCase()}%`) },
    });

    return entities.map((entity) => CurrencyMapper.toDomain(entity));
  }

  async update(
    id: Currency['id'],
    payload: Partial<Currency>,
  ): Promise<Currency> {
    const entity = await this.currencyRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.currencyRepository.save(
      this.currencyRepository.create(
        CurrencyMapper.toPersistence({
          ...CurrencyMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return CurrencyMapper.toDomain(updatedEntity);
  }

  async remove(id: Currency['id']): Promise<void> {
    await this.currencyRepository.delete(id);
  }

  async getDefaultBaseCurrencyMAD(): Promise<Currency | null> {
    return this.currencyRepository.findOne({
      where: { code: 'MAD' },
    });
  }
}
