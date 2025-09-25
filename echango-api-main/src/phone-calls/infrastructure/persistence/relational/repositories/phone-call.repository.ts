import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PhoneCallEntity } from '../entities/phone-call.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { PhoneCall } from '../../../../domain/phone-call';
import { PhoneCallRepository } from '../../phone-call.repository';
import { PhoneCallMapper } from '../mappers/phone-call.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class PhoneCallRelationalRepository implements PhoneCallRepository {
  constructor(
    @InjectRepository(PhoneCallEntity)
    private readonly phoneCallRepository: Repository<PhoneCallEntity>,
  ) {}

  async create(data: PhoneCall): Promise<PhoneCall> {
    const persistenceModel = PhoneCallMapper.toPersistence(data);
    const newEntity = await this.phoneCallRepository.save(
      this.phoneCallRepository.create(persistenceModel),
    );
    return PhoneCallMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<PhoneCall[]> {
    const entities = await this.phoneCallRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => PhoneCallMapper.toDomain(entity));
  }

  async findById(id: PhoneCall['id']): Promise<NullableType<PhoneCall>> {
    const entity = await this.phoneCallRepository.findOne({
      where: { id },
    });

    return entity ? PhoneCallMapper.toDomain(entity) : null;
  }

  async findByIds(ids: PhoneCall['id'][]): Promise<PhoneCall[]> {
    const entities = await this.phoneCallRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => PhoneCallMapper.toDomain(entity));
  }

  async update(
    id: PhoneCall['id'],
    payload: Partial<PhoneCall>,
  ): Promise<PhoneCall> {
    const entity = await this.phoneCallRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.phoneCallRepository.save(
      this.phoneCallRepository.create(
        PhoneCallMapper.toPersistence({
          ...PhoneCallMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return PhoneCallMapper.toDomain(updatedEntity);
  }

  async remove(id: PhoneCall['id']): Promise<void> {
    await this.phoneCallRepository.delete(id);
  }

  async getPhoneCallsCount(
    officeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.phoneCallRepository
      .createQueryBuilder('pc')
      .where('pc.office_id = :officeId', { officeId })
      .andWhere('pc.createdAt >= :startDate', { startDate })
      .andWhere('pc.createdAt <= :endDate', { endDate })
      .getCount();

    return result;
  }

  async getPhoneCallsCountForAllOffices(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.phoneCallRepository
      .createQueryBuilder('pc')
      .andWhere('pc.createdAt >= :startDate', { startDate })
      .andWhere('pc.createdAt <= :endDate', { endDate })
      .getCount();

    return result;
  }

  async getBulkPhoneCallsCounts(
    officeIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, number>> {
    if (officeIds.length === 0) {
      return {};
    }

    const results = await this.phoneCallRepository
      .createQueryBuilder('pc')
      .select('pc.office_id', 'officeId')
      .addSelect('COUNT(pc.id)', 'count')
      .where('pc.office_id IN (:...officeIds)', { officeIds })
      .andWhere('pc.createdAt >= :startDate', { startDate })
      .andWhere('pc.createdAt <= :endDate', { endDate })
      .groupBy('pc.office_id')
      .getRawMany();

    const countsMap: Record<string, number> = {};
    results.forEach((result) => {
      countsMap[result.officeId] = parseInt(result.count, 10);
    });

    return countsMap;
  }
}
