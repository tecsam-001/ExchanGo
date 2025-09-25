import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProfileViewEntity } from '../entities/profile-view.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { ProfileView } from '../../../../domain/profile-view';
import { ProfileViewRepository } from '../../profile-view.repository';
import { ProfileViewMapper } from '../mappers/profile-view.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class ProfileViewRelationalRepository implements ProfileViewRepository {
  constructor(
    @InjectRepository(ProfileViewEntity)
    private readonly profileViewRepository: Repository<ProfileViewEntity>,
  ) {}

  async create(data: ProfileView): Promise<ProfileView> {
    const persistenceModel = ProfileViewMapper.toPersistence(data);
    const newEntity = await this.profileViewRepository.save(
      this.profileViewRepository.create(persistenceModel),
    );
    return ProfileViewMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<ProfileView[]> {
    const entities = await this.profileViewRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => ProfileViewMapper.toDomain(entity));
  }

  async findById(id: ProfileView['id']): Promise<NullableType<ProfileView>> {
    const entity = await this.profileViewRepository.findOne({
      where: { id },
    });

    return entity ? ProfileViewMapper.toDomain(entity) : null;
  }

  async findByIds(ids: ProfileView['id'][]): Promise<ProfileView[]> {
    const entities = await this.profileViewRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => ProfileViewMapper.toDomain(entity));
  }

  async update(
    id: ProfileView['id'],
    payload: Partial<ProfileView>,
  ): Promise<ProfileView> {
    const entity = await this.profileViewRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.profileViewRepository.save(
      this.profileViewRepository.create(
        ProfileViewMapper.toPersistence({
          ...ProfileViewMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return ProfileViewMapper.toDomain(updatedEntity);
  }

  async remove(id: ProfileView['id']): Promise<void> {
    await this.profileViewRepository.delete(id);
  }

  async getProfileViewsCount(
    officeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.profileViewRepository
      .createQueryBuilder('pv')
      .where('pv.office_id = :officeId', { officeId })
      .andWhere('pv.createdAt >= :startDate', { startDate })
      .andWhere('pv.createdAt <= :endDate', { endDate })
      .getCount();

    return result;
  }

  async getProfileViewsCountForAllOffices(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.profileViewRepository
      .createQueryBuilder('pv')
      .andWhere('pv.createdAt >= :startDate', { startDate })
      .andWhere('pv.createdAt <= :endDate', { endDate })
      .getCount();

    return result;
  }

  async getBulkProfileViewsCounts(
    officeIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, number>> {
    if (officeIds.length === 0) {
      return {};
    }

    const results = await this.profileViewRepository
      .createQueryBuilder('pv')
      .select('pv.office_id', 'officeId')
      .addSelect('COUNT(pv.id)', 'count')
      .where('pv.office_id IN (:...officeIds)', { officeIds })
      .andWhere('pv.createdAt >= :startDate', { startDate })
      .andWhere('pv.createdAt <= :endDate', { endDate })
      .groupBy('pv.office_id')
      .getRawMany();

    const countsMap: Record<string, number> = {};
    results.forEach((result) => {
      countsMap[result.officeId] = parseInt(result.count, 10);
    });

    return countsMap;
  }
}
