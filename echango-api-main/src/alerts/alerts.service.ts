import {
  // common
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { AlertRepository } from './infrastructure/persistence/alert.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Alert } from './domain/alert';
import { Currency } from 'src/currencies/domain/currency';
import { Office } from 'src/offices/domain/office';
import { User } from 'src/users/domain/user';
import { OfficesService } from 'src/offices/offices.service';
import { CurrenciesService } from 'src/currencies/currencies.service';
import { UsersService } from 'src/users/users.service';
import { CitiesService } from 'src/cities/cities.service';
import { TriggerType } from './infrastructure/persistence/relational/entities/alert.entity';
import { City } from 'src/cities/domain/city';

@Injectable()
export class AlertsService {
  constructor(
    // Dependencies here
    private readonly alertRepository: AlertRepository,
    private readonly officesService: OfficesService,
    private readonly currenciesService: CurrenciesService,
    private readonly usersService: UsersService,
    private readonly citiesService: CitiesService,
  ) {}

  async create(createAlertDto: CreateAlertDto) {
    // Do not remove comment below.
    // <creating-property />

    // Validate trigger type requirements
    if (
      createAlertDto.triggerType === TriggerType.OFFICE &&
      (!createAlertDto.offices || createAlertDto.offices.length === 0)
    ) {
      throw new BadRequestException(
        'At least one office ID is required when trigger type is OFFICE',
      );
    }

    if (
      createAlertDto.triggerType === TriggerType.CITY &&
      (!createAlertDto.cities || createAlertDto.cities.length === 0)
    ) {
      throw new BadRequestException(
        'At least one city ID is required when trigger type is CITY',
      );
    }

    let user: User | null = null;
    const cities: City[] = [];
    const offices: Office[] = [];

    if (
      createAlertDto.triggerType === TriggerType.OFFICE &&
      createAlertDto.offices
    ) {
      for (const officeId of createAlertDto.offices) {
        const office = await this.officesService.findById(officeId);
        if (!office) {
          throw new NotFoundException(`Office with ID ${officeId} not found`);
        }
        offices.push(office);
      }
    }

    const currency = await this.currenciesService.findByCode(
      createAlertDto.currency,
    );
    if (!currency) {
      throw new NotFoundException(
        `Currency with code ${createAlertDto.currency} not found`,
      );
    }

    if (createAlertDto.user) {
      user = await this.usersService.findById(createAlertDto.user);
      if (!user) {
        throw new NotFoundException(
          `User with ID ${createAlertDto.user} not found`,
        );
      }
    }

    const targetCurrency = await this.currenciesService.findByCode(
      createAlertDto.targetCurrency,
    );
    if (!targetCurrency) {
      throw new NotFoundException(
        `Target currency with code ${createAlertDto.targetCurrency} not found`,
      );
    }

    if (
      createAlertDto.triggerType === TriggerType.CITY &&
      createAlertDto.cities
    ) {
      for (const cityId of createAlertDto.cities) {
        const cityEntity = await this.citiesService.findById(cityId);
        if (!cityEntity) {
          throw new NotFoundException(`City with ID ${cityId} not found`);
        }
        cities.push(cityEntity);
      }
    }

    return this.alertRepository.create({
      ...createAlertDto,
      offices: offices,
      currency: currency as Currency,
      user: user as User,
      targetCurrency: targetCurrency as Currency,
      cities: cities,
      triggerType: createAlertDto.triggerType as TriggerType,
      // Do not remove comment below.
      // <creating-property-payload />
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.alertRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Alert['id']) {
    return this.alertRepository.findById(id);
  }

  findByIds(ids: Alert['id'][]) {
    return this.alertRepository.findByIds(ids);
  }

  async update(
    id: Alert['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateAlertDto: UpdateAlertDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.alertRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: Alert['id']) {
    return this.alertRepository.remove(id);
  }

  async getMatchingAlerts({
    city,
    baseCurrencyId,
    targetCurrencyId,
    targetCurrencyRate,
  }: {
    city: string;
    baseCurrencyId: string;
    targetCurrencyId: string;
    targetCurrencyRate: number;
  }) {
    return this.alertRepository.getMatchingAlerts({
      city,
      baseCurrencyId,
      targetCurrencyId,
      targetCurrencyRate,
    });
  }

  async getMatchingAlertsAdvanced({
    triggerType,
    city,
    office,
    baseCurrencyId,
    targetCurrencyId,
    targetCurrencyRate,
  }: {
    triggerType: TriggerType;
    city?: string;
    office?: string;
    baseCurrencyId: string;
    targetCurrencyId: string;
    targetCurrencyRate: number;
  }) {
    return this.alertRepository.getMatchingAlertsAdvanced({
      triggerType,
      city,
      office,
      baseCurrencyId,
      targetCurrencyId,
      targetCurrencyRate,
    });
  }

  // @OnEvent('rate.update')
  // handleRateUpdate(event: RateUpdateEvent) {
  //   console.log('Rate updated:', event);
  // }

  async getActiveAlertsCount(officeId: string): Promise<number> {
    return this.alertRepository.getActiveAlertsCount(officeId);
  }

  async getActiveAlertsCountForPeriod(
    officeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return this.alertRepository.getActiveAlertsCountForPeriod(
      officeId,
      startDate,
      endDate,
    );
  }

  async getAlertsCreatedCount(
    officeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return this.alertRepository.getAlertsCreatedCount(
      officeId,
      startDate,
      endDate,
    );
  }

  async getAlertsCreatedCountForAllOffices(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return this.alertRepository.getAlertsCreatedCountForAllOffices(
      startDate,
      endDate,
    );
  }

  async getActiveAlertsCountForAllOffices(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return this.alertRepository.getActiveAlertsCountForAllOffices(
      startDate,
      endDate,
    );
  }

  async getActiveAlertsCountForPeriodForAllOffices(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return this.alertRepository.getActiveAlertsCountForPeriodForAllOffices(
      startDate,
      endDate,
    );
  }

  async getBulkAlertsCreatedCounts(
    officeIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, number>> {
    return this.alertRepository.getBulkAlertsCreatedCounts(
      officeIds,
      startDate,
      endDate,
    );
  }
}
