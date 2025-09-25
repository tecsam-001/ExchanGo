import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { CurrencyRepository } from './infrastructure/persistence/currency.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Currency } from './domain/currency';

@Injectable()
export class CurrenciesService {
  constructor(
    // Dependencies here
    private readonly currencyRepository: CurrencyRepository,
  ) {}

  async create(createCurrencyDto: CreateCurrencyDto) {
    // Do not remove comment below.
    // <creating-property />

    return this.currencyRepository.create({
      ...createCurrencyDto,
      // Do not remove comment below.
      // <creating-property-payload />
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.currencyRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Currency['id']) {
    return this.currencyRepository.findById(id);
  }

  findByCode(code: Currency['code']) {
    return this.currencyRepository.findByCode(code.toUpperCase());
  }

  searchByCode(query: string) {
    return this.currencyRepository.searchByCode(query);
  }

  findByIds(ids: Currency['id'][]) {
    return this.currencyRepository.findByIds(ids);
  }

  async update(
    id: Currency['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateCurrencyDto: UpdateCurrencyDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.currencyRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: Currency['id']) {
    return this.currencyRepository.remove(id);
  }

  getDefaultBaseCurrencyMAD() {
    return this.currencyRepository.getDefaultBaseCurrencyMAD();
  }
}
