import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AlertEntity, TriggerType } from '../entities/alert.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Alert } from '../../../../domain/alert';
import { Currency } from '../../../../../currencies/domain/currency';
import { AlertRepository } from '../../alert.repository';
import { AlertMapper } from '../mappers/alert.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class AlertRelationalRepository implements AlertRepository {
  constructor(
    @InjectRepository(AlertEntity)
    private readonly alertRepository: Repository<AlertEntity>,
  ) {}

  async create(data: Alert): Promise<Alert> {
    const persistenceModel = AlertMapper.toPersistence(data);
    const newEntity = await this.alertRepository.save(
      this.alertRepository.create(persistenceModel),
    );
    return AlertMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Alert[]> {
    const entities = await this.alertRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => AlertMapper.toDomain(entity));
  }

  async findById(id: Alert['id']): Promise<NullableType<Alert>> {
    const entity = await this.alertRepository.findOne({
      where: { id },
      relations: ['cities', 'offices', 'currency', 'targetCurrency', 'user'],
    });

    return entity ? AlertMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Alert['id'][]): Promise<Alert[]> {
    const entities = await this.alertRepository.find({
      where: { id: In(ids) },
      relations: ['cities', 'offices', 'currency', 'targetCurrency', 'user'],
    });

    return entities.map((entity) => AlertMapper.toDomain(entity));
  }

  async update(id: Alert['id'], payload: Partial<Alert>): Promise<Alert> {
    const entity = await this.alertRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.alertRepository.save(
      this.alertRepository.create(
        AlertMapper.toPersistence({
          ...AlertMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return AlertMapper.toDomain(updatedEntity);
  }

  async remove(id: Alert['id']): Promise<void> {
    await this.alertRepository.delete(id);
  }

  async getMatchingAlerts({
    city,
    baseCurrencyId,
    targetCurrencyId,
    targetCurrencyRate,
  }: {
    city: string;
    baseCurrencyId: Currency['id'];
    targetCurrencyId: Currency['id'];
    targetCurrencyRate: number;
  }): Promise<Alert[]> {
    const entities = await this.alertRepository
      .createQueryBuilder('alert')
      .innerJoinAndSelect('alert.cities', 'city')
      .innerJoinAndSelect('alert.currency', 'currency')
      .innerJoinAndSelect('alert.targetCurrency', 'targetCurrency')
      .leftJoinAndSelect('alert.user', 'user')
      .where('city.id = :cityId', { cityId: city })
      .andWhere('currency.id = :baseCurrencyId', { baseCurrencyId })
      .andWhere('targetCurrency.id = :targetCurrencyId', { targetCurrencyId })
      .andWhere('alert.targetCurrencyAmount >= :targetCurrencyRate', {
        targetCurrencyRate,
      })
      .andWhere('alert.isActive = :isActive', { isActive: true })
      .getMany();

    return entities.map((entity) => AlertMapper.toDomain(entity));
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
    baseCurrencyId: Currency['id'];
    targetCurrencyId: Currency['id'];
    targetCurrencyRate: number;
  }): Promise<Alert[]> {
    let queryBuilder = this.alertRepository
      .createQueryBuilder('alert')
      .innerJoinAndSelect('alert.currency', 'currency')
      .innerJoinAndSelect('alert.targetCurrency', 'targetCurrency')
      .leftJoinAndSelect('alert.user', 'user');

    if (triggerType === TriggerType.OFFICE) {
      // For office alerts, we need to load ALL offices and filter by the specific office
      queryBuilder = queryBuilder
        .leftJoinAndSelect('alert.offices', 'office')
        .innerJoin('alert.offices', 'filterOffice')
        .where('filterOffice.id = :officeId', { officeId: office });
    } else if (triggerType === TriggerType.CITY) {
      // For city alerts, we need to load ALL cities and filter by the specific city
      queryBuilder = queryBuilder
        .leftJoinAndSelect('alert.cities', 'city')
        .innerJoin('alert.cities', 'filterCity')
        .where('filterCity.id = :cityId', { cityId: city });
    }

    const entities = await queryBuilder
      .andWhere('currency.id = :baseCurrencyId', { baseCurrencyId })
      .andWhere('targetCurrency.id = :targetCurrencyId', { targetCurrencyId })
      .andWhere('alert.targetCurrencyAmount >= :targetCurrencyRate', {
        targetCurrencyRate,
      })
      .andWhere('alert.isActive = :isActive', { isActive: true })
      .getMany();

    return entities.map((entity) => AlertMapper.toDomain(entity));
  }

  async getActiveAlertsCount(officeId: string): Promise<number> {
    //TODO: change back to true
    const result = await this.alertRepository
      .createQueryBuilder('alert')
      .innerJoin('alert.offices', 'office')
      .where('office.id = :officeId', { officeId })
      .andWhere('alert.isActive = :isActive', { isActive: false })
      .getCount();

    return result;
  }

  async getActiveAlertsCountForPeriod(
    officeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.alertRepository
      .createQueryBuilder('alert')
      .innerJoin('alert.offices', 'office')
      .where('office.id = :officeId', { officeId })
      .andWhere('alert.isActive = :isActive', { isActive: true })
      .andWhere('alert.createdAt >= :startDate', { startDate })
      .andWhere('alert.createdAt <= :endDate', { endDate })
      .getCount();
    return result;
  }

  async getAlertsCreatedCount(
    officeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.alertRepository
      .createQueryBuilder('alert')
      .innerJoin('alert.offices', 'office')
      .where('office.id = :officeId', { officeId })
      .andWhere('alert.createdAt >= :startDate', { startDate })
      .andWhere('alert.createdAt <= :endDate', { endDate })
      .getCount();
    return result;
  }

  async getActiveAlertsCountForAllOffices(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.alertRepository
      .createQueryBuilder('alert')
      .andWhere('alert.createdAt >= :startDate', { startDate })
      .andWhere('alert.createdAt <= :endDate', { endDate })
      .getCount();
    return result;
  }

  async getAlertsCreatedCountForAllOffices(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.alertRepository
      .createQueryBuilder('alert')
      .andWhere('alert.createdAt >= :startDate', { startDate })
      .andWhere('alert.createdAt <= :endDate', { endDate })
      .getCount();
    return result;
  }

  async getActiveAlertsCountForPeriodForAllOffices(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.alertRepository
      .createQueryBuilder('alert')
      .andWhere('alert.createdAt >= :startDate', { startDate })
      .andWhere('alert.createdAt <= :endDate', { endDate })
      .getCount();
    return result;
  }

  async getBulkAlertsCreatedCounts(
    officeIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, number>> {
    if (officeIds.length === 0) {
      return {};
    }

    const results = await this.alertRepository
      .createQueryBuilder('alert')
      .innerJoin('alert.offices', 'office')
      .select('office.id', 'officeId')
      .addSelect('COUNT(alert.id)', 'count')
      .where('office.id IN (:...officeIds)', { officeIds })
      .andWhere('alert.createdAt >= :startDate', { startDate })
      .andWhere('alert.createdAt <= :endDate', { endDate })
      .groupBy('office.id')
      .getRawMany();

    const countsMap: Record<string, number> = {};
    results.forEach((result) => {
      countsMap[result.officeId] = parseInt(result.count, 10);
    });

    return countsMap;
  }
}
