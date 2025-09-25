import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, SelectQueryBuilder } from 'typeorm';
import { OfficeRateEntity } from '../entities/office-rate.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { OfficeRate } from '../../../../domain/office-rate';
import { OfficeRateRepository } from '../../office-rate.repository';
import { OfficeRateMapper } from '../mappers/office-rate.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { TZDate } from '@date-fns/tz';

import {
  CityRankingParams,
  CityRankingResult,
  OfficeActivityData,
  GetOfficeActivityParams,
} from '../../../../types';

@Injectable()
export class OfficeRateRelationalRepository implements OfficeRateRepository {
  constructor(
    @InjectRepository(OfficeRateEntity)
    private readonly officeRateRepository: Repository<OfficeRateEntity>,
  ) {}

  async create(data: OfficeRate): Promise<OfficeRate> {
    const persistenceModel = OfficeRateMapper.toPersistence(data);
    const newEntity = await this.officeRateRepository.save(
      this.officeRateRepository.create(persistenceModel),
    );
    return OfficeRateMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<OfficeRate[]> {
    const entities = await this.officeRateRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => OfficeRateMapper.toDomain(entity));
  }

  async findById(id: OfficeRate['id']): Promise<NullableType<OfficeRate>> {
    const entity = await this.officeRateRepository.findOne({
      where: { id },
    });

    return entity ? OfficeRateMapper.toDomain(entity) : null;
  }

  async findByIds(ids: OfficeRate['id'][]): Promise<OfficeRate[]> {
    const entities = await this.officeRateRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => OfficeRateMapper.toDomain(entity));
  }

  async update(
    id: OfficeRate['id'],
    payload: Partial<OfficeRate>,
  ): Promise<OfficeRate> {
    const entity = await this.officeRateRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.officeRateRepository.save(
      this.officeRateRepository.create(
        OfficeRateMapper.toPersistence({
          ...OfficeRateMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return OfficeRateMapper.toDomain(updatedEntity);
  }

  async remove(id: OfficeRate['id']): Promise<void> {
    await this.officeRateRepository.delete(id);
  }

  async getCityRankingForExchangeRates({
    baseCurrencyCode,
    targetCurrencyCode,
    amount = 1,
  }: CityRankingParams): Promise<CityRankingResult[]> {
    // Get the current date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('data', {
      baseCurrencyCode,
      targetCurrencyCode,
      amount,
    });

    // if targetCurrencyCode is MAD switch the target with the base and use rate.buyRate instead of sellRate in the query
    const isMAD = targetCurrencyCode === 'MAD';
    if (isMAD) {
      targetCurrencyCode = baseCurrencyCode;
      baseCurrencyCode = 'MAD';
    }
    const rateField = isMAD ? 'buyRate' : 'sellRate';

    // First query: Get average rates per city
    const avgRatesQuery = await this.officeRateRepository
      .createQueryBuilder('rate')
      .select([
        'city.name AS "cityName"',
        `AVG(rate.${rateField}) AS "avgRate"`,
      ])
      .innerJoin('rate.office', 'office')
      .innerJoin('office.city', 'city')
      .innerJoin('rate.baseCurrency', 'baseCurrency')
      .innerJoin('rate.targetCurrency', 'targetCurrency')
      .where('baseCurrency.code = :baseCurrencyCode', { baseCurrencyCode })
      .andWhere('targetCurrency.code = :targetCurrencyCode', {
        targetCurrencyCode,
      })
      .andWhere('rate.isActive = true')
      .andWhere('office.isActive = false')
      .andWhere('office.isVerified = false')
      //.andWhere('rate.createdAt >= :today', { today })
      .groupBy('city.name')
      .getRawMany();

    console.log('avgRatesQuery', avgRatesQuery);

    // Convert to a map for easy lookup
    const avgRatesMap = new Map(
      avgRatesQuery.map((item) => [item.cityName, parseFloat(item.avgRate)]),
    );

    // Second query: Get best rates (MAXIMUM rates for MAD conversion, MINIMUM for others) and office names + slugs per city
    const bestRatesQuery = await this.officeRateRepository
      .createQueryBuilder('rate')
      .select([
        'city.name AS "cityName"',
        `${isMAD ? 'MAX' : 'MIN'}(rate.${rateField}) AS "bestRate"`, // MAX for MAD (higher is better), MIN for others (lower is better)
        'office.officeName AS "officeName"',
        'office.slug AS "officeSlug"',
      ])
      .innerJoin('rate.office', 'office')
      .innerJoin('office.city', 'city')
      .innerJoin('rate.baseCurrency', 'baseCurrency')
      .innerJoin('rate.targetCurrency', 'targetCurrency')
      .where('baseCurrency.code = :baseCurrencyCode', { baseCurrencyCode })
      .andWhere('targetCurrency.code = :targetCurrencyCode', {
        targetCurrencyCode,
      })
      .andWhere('rate.isActive = true')
      .andWhere('office.isActive = false')
      .andWhere('office.isVerified = false')
      //.andWhere('rate.createdAt >= :today', { today })
      .groupBy('city.name')
      .addGroupBy('office.officeName')
      .addGroupBy('office.slug')
      .orderBy(
        `${isMAD ? 'MAX' : 'MIN'}(rate.${rateField})`,
        isMAD ? 'DESC' : 'ASC',
      ) // DESC for MAD (best first), ASC for others
      .getRawMany();

    // Process the results to get the top office per city
    const cityBestRates = new Map();
    const cityOffices = new Map();
    const cityOfficeSlugs = new Map();

    for (const item of bestRatesQuery) {
      const cityName = item.cityName;
      const rate = parseFloat(item.bestRate);

      // For MAD conversion: higher rate is better, for others: lower rate is better
      const isBetterRate = isMAD
        ? !cityBestRates.has(cityName) || rate > cityBestRates.get(cityName)
        : !cityBestRates.has(cityName) || rate < cityBestRates.get(cityName);

      if (isBetterRate) {
        cityBestRates.set(cityName, rate);
        cityOffices.set(cityName, item.officeName);
        cityOfficeSlugs.set(cityName, item.officeSlug);
      }
    }

    // Combine results
    const results = Array.from(cityBestRates.keys()).map((cityName) => ({
      city: cityName,
      bestRate: cityBestRates.get(cityName),
      averageRate: avgRatesMap.get(cityName) || cityBestRates.get(cityName),
      exchangeOffice: cityOffices.get(cityName),
      exchangeOfficeSlug: cityOfficeSlugs.get(cityName),
    }));

    // Sort by best rate: for MAD conversion (descending - highest first), for others (ascending - lowest first)
    results.sort((a, b) =>
      isMAD ? b.bestRate - a.bestRate : a.bestRate - b.bestRate,
    );

    // Format and add ranking
    return results.map((item, index) => ({
      rank: index + 1,
      city: item.city,
      averageRate: parseFloat(item.averageRate.toFixed(2)) * amount,
      bestRate: parseFloat(item.bestRate.toFixed(2)) * amount,
      exchangeOffice: item.exchangeOffice,
      exchangeOfficeSlug: item.exchangeOfficeSlug,
    }));
  }

  async getOfficeRatesByOfficeId(officeId: string): Promise<OfficeRate[]> {
    const entities = await this.officeRateRepository.find({
      where: { office: { id: officeId } },
    });
    return entities.map((entity) => OfficeRateMapper.toDomain(entity));
  }

  async findByOfficeAndCurrency(
    officeId: string,
    currencyId: string,
  ): Promise<NullableType<OfficeRate>> {
    const entity = await this.officeRateRepository.findOne({
      where: { office: { id: officeId }, targetCurrency: { id: currencyId } },
    });
    return entity ? OfficeRateMapper.toDomain(entity) : null;
  }

  async getOfficeActivityData(
    params: GetOfficeActivityParams = {},
  ): Promise<OfficeActivityData[]> {
    const {
      period = '7days',
      cityId,
      cityIds,
      countryId,
      isActiveOnly = false,
      limit = 50,
      offset = 0,
    } = params;

    // Calculate date range based on period
    const periodDays = this.getPeriodDays(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Use cityIds if provided, otherwise fall back to single cityId for backward compatibility
    const citiesToFilter =
      cityIds && cityIds.length > 0 ? cityIds : cityId ? [cityId] : undefined;

    const query = this.buildActivityQuery(
      startDate,
      citiesToFilter,
      countryId,
      isActiveOnly,
    );

    const results = await query.limit(limit).offset(offset).getRawMany();
    console.log('results', results);

    return results.map(this.mapToOfficeActivityData);
  }

  async getOfficeActivityDataCount(
    params: GetOfficeActivityParams = {},
  ): Promise<number> {
    const {
      period = '7days',
      cityId,
      cityIds,
      countryId,
      isActiveOnly = false,
    } = params;

    // Calculate date range based on period
    const periodDays = this.getPeriodDays(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Use cityIds if provided, otherwise fall back to single cityId for backward compatibility
    const citiesToFilter =
      cityIds && cityIds.length > 0 ? cityIds : cityId ? [cityId] : undefined;

    const query = this.buildActivityQuery(
      startDate,
      citiesToFilter,
      countryId,
      isActiveOnly,
    );

    const count = await query.getCount();
    return count;
  }

  async getOfficeRatesWithActivity(
    officeId: string,
    period: '7days' | '30days' | '90days' = '7days',
  ): Promise<{
    rates: OfficeRateEntity[];
    activityData: OfficeActivityData;
  }> {
    // Get current rates
    const rates = await this.officeRateRepository.find({
      where: {
        office: { id: officeId },
        isActive: true,
      },
      relations: ['office', 'baseCurrency', 'targetCurrency'],
      order: { updatedAt: 'DESC' },
    });

    // Get activity data
    const activityData = await this.getOfficeActivityData({
      period,
      limit: 1,
    });

    const officeActivity = activityData.find(
      (data) => data.office.id === officeId,
    );

    return {
      rates,
      activityData: officeActivity || this.createDefaultActivityData(officeId),
    };
  }

  async getTopActiveOffices(
    period: '7days' | '30days' | '90days' = '7days',
    limit: number = 10,
  ): Promise<OfficeActivityData[]> {
    const periodDays = this.getPeriodDays(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const query = this.buildActivityQuery(startDate);

    const results = await query
      .orderBy('updates_count', 'DESC')
      .addOrderBy('last_update', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map(this.mapToOfficeActivityData);
  }

  private buildActivityQuery(
    startDate: Date,
    cityIds?: string[],
    countryId?: string,
    isActiveOnly?: boolean,
  ): SelectQueryBuilder<any> {
    // Start from office table to get ALL offices, not just those with rates
    const query = this.officeRateRepository.manager
      .createQueryBuilder()
      .from('office', 'office')
      .leftJoin('office.rates', 'rate', 'rate.deletedAt IS NULL')
      .leftJoin('office.city', 'city')
      .leftJoin('office.country', 'country')
      .leftJoin(
        (subQuery) => {
          return subQuery
            .select(['rh.officeId as officeId', 'COUNT(*) as history_count'])
            .from('rate_history', 'rh')
            .where(`rh.createdAt >= '${startDate.toISOString()}'`)
            .groupBy('rh.officeId');
        },
        'history_stats',
        'history_stats.officeId = office.id',
      )
      .select([
        'office.id as office_id',
        'office.office_name as office_name',
        'city.name as city_name',
        'country.name as country_name',
        'COALESCE(MAX(rate.updatedAt), office.updatedAt) as last_update',
        'COALESCE(history_stats.history_count, 0) as updates_count',
      ])
      .where('office.deletedAt IS NULL')
      .groupBy(
        'office.id, office.office_name, city.name, country.name, office.updatedAt, history_stats.history_count',
      );

    if (cityIds && cityIds.length > 0) {
      query.andWhere('office.city_id IN (:...cityIds)', { cityIds });
    }

    if (countryId) {
      query.andWhere('office.country_id = :countryId', { countryId });
    }

    if (isActiveOnly) {
      query.andWhere('office.is_active = true');
    }

    return query;
  }

  private mapToOfficeActivityData = (result: any): OfficeActivityData => {
    const updatesCount = parseInt(result.updates_count) || 0;
    const { activityStatus, activityColor } =
      this.getActivityStatus(updatesCount);

    const utcDate = new Date(result.last_update);
    const localDate = new TZDate(utcDate, 'Africa/Casablanca');

    return {
      office: {
        id: result.office_id,
        officeName: result.office_name,
        city: result.city_name ? { name: result.city_name } : undefined,
        country: result.country_name
          ? { name: result.country_name }
          : undefined,
      },
      lastUpdate: localDate,
      updatesCount,
      activityStatus,
      activityColor,
    };
  };

  private getActivityStatus(updatesCount: number): {
    activityStatus: 'Very Active' | 'Active' | 'Low Activity' | 'Inactive';
    activityColor: 'Green' | 'Yellow' | 'Red' | 'Grey';
  } {
    if (updatesCount >= 20) {
      return { activityStatus: 'Very Active', activityColor: 'Green' };
    } else if (updatesCount >= 7) {
      return { activityStatus: 'Active', activityColor: 'Yellow' };
    } else if (updatesCount >= 2) {
      return { activityStatus: 'Low Activity', activityColor: 'Red' };
    } else {
      return { activityStatus: 'Inactive', activityColor: 'Grey' };
    }
  }

  private getPeriodDays(period: '7days' | '30days' | '90days'): number {
    switch (period) {
      case '7days':
        return 7;
      case '30days':
        return 30;
      case '90days':
        return 90;
      default:
        return 7;
    }
  }

  private createDefaultActivityData(officeId: string): OfficeActivityData {
    return {
      office: {
        id: officeId,
        officeName: 'Unknown Office',
      },
      lastUpdate: new Date(),
      updatesCount: 0,
      activityStatus: 'Inactive',
      activityColor: 'Grey',
    };
  }
}
