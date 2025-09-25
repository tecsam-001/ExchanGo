import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { GpsClickEntity } from '../entities/gps-click.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { GpsClick } from '../../../../domain/gps-click';
import { GpsClickRepository } from '../../gps-click.repository';
import { GpsClickMapper } from '../mappers/gps-click.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class GpsClickRelationalRepository implements GpsClickRepository {
  constructor(
    @InjectRepository(GpsClickEntity)
    private readonly gpsClickRepository: Repository<GpsClickEntity>,
  ) {}

  async create(data: GpsClick): Promise<GpsClick> {
    const persistenceModel = GpsClickMapper.toPersistence(data);
    const newEntity = await this.gpsClickRepository.save(
      this.gpsClickRepository.create(persistenceModel),
    );
    return GpsClickMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<GpsClick[]> {
    const entities = await this.gpsClickRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => GpsClickMapper.toDomain(entity));
  }

  async findById(id: GpsClick['id']): Promise<NullableType<GpsClick>> {
    const entity = await this.gpsClickRepository.findOne({
      where: { id },
    });

    return entity ? GpsClickMapper.toDomain(entity) : null;
  }

  async findByIds(ids: GpsClick['id'][]): Promise<GpsClick[]> {
    const entities = await this.gpsClickRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => GpsClickMapper.toDomain(entity));
  }

  async update(
    id: GpsClick['id'],
    payload: Partial<GpsClick>,
  ): Promise<GpsClick> {
    const entity = await this.gpsClickRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.gpsClickRepository.save(
      this.gpsClickRepository.create(
        GpsClickMapper.toPersistence({
          ...GpsClickMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return GpsClickMapper.toDomain(updatedEntity);
  }

  async remove(id: GpsClick['id']): Promise<void> {
    await this.gpsClickRepository.delete(id);
  }

  async getGpsClicksCount(
    officeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.gpsClickRepository
      .createQueryBuilder('gc')
      .where('gc.office_id = :officeId', { officeId })
      .andWhere('gc.createdAt >= :startDate', { startDate })
      .andWhere('gc.createdAt <= :endDate', { endDate })
      .getCount();

    return result;
  }

  async getGpsClicksCountForAllOffices(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.gpsClickRepository
      .createQueryBuilder('gc')
      .andWhere('gc.createdAt >= :startDate', { startDate })
      .andWhere('gc.createdAt <= :endDate', { endDate })
      .getCount();

    return result;
  }

  async getBulkGpsClicksCounts(
    officeIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, number>> {
    if (officeIds.length === 0) {
      return {};
    }

    const results = await this.gpsClickRepository
      .createQueryBuilder('gc')
      .select('gc.office_id', 'officeId')
      .addSelect('COUNT(gc.id)', 'count')
      .where('gc.office_id IN (:...officeIds)', { officeIds })
      .andWhere('gc.createdAt >= :startDate', { startDate })
      .andWhere('gc.createdAt <= :endDate', { endDate })
      .groupBy('gc.office_id')
      .getRawMany();

    const countsMap: Record<string, number> = {};
    results.forEach((result) => {
      countsMap[result.officeId] = parseInt(result.count, 10);
    });

    return countsMap;
  }
}
