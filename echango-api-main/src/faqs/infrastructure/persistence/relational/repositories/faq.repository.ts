import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FaqEntity } from '../entities/faq.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Faq } from '../../../../domain/faq';
import { FaqRepository } from '../../faq.repository';
import { FaqMapper } from '../mappers/faq.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class FaqRelationalRepository implements FaqRepository {
  constructor(
    @InjectRepository(FaqEntity)
    private readonly faqRepository: Repository<FaqEntity>,
  ) {}

  async create(data: Faq): Promise<Faq> {
    const persistenceModel = FaqMapper.toPersistence(data);
    const newEntity = await this.faqRepository.save(
      this.faqRepository.create(persistenceModel),
    );
    return FaqMapper.toDomain(newEntity);
  }

  async createMany(data: Faq[]): Promise<Faq[]> {
    const persistenceModels = data.map((faq) => FaqMapper.toPersistence(faq));
    const newEntities = await this.faqRepository.save(
      this.faqRepository.create(persistenceModels),
    );
    return newEntities.map((entity) => FaqMapper.toDomain(entity));
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Faq[]> {
    const entities = await this.faqRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => FaqMapper.toDomain(entity));
  }

  async findById(id: Faq['id']): Promise<NullableType<Faq>> {
    const entity = await this.faqRepository.findOne({
      where: { id },
      relations: ['office'],
    });

    return entity ? FaqMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Faq['id'][]): Promise<Faq[]> {
    const entities = await this.faqRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => FaqMapper.toDomain(entity));
  }

  async findByOfficeId(officeId: string): Promise<Faq[]> {
    const entities = await this.faqRepository.find({
      where: { office: { id: officeId }, isActive: true },
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => FaqMapper.toDomain(entity));
  }

  async findByOfficeIdWithPagination({
    officeId,
    paginationOptions,
  }: {
    officeId: string;
    paginationOptions: IPaginationOptions;
  }): Promise<Faq[]> {
    const entities = await this.faqRepository.find({
      where: { office: { id: officeId }, isActive: true },
      order: { createdAt: 'DESC' },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => FaqMapper.toDomain(entity));
  }

  async update(id: Faq['id'], payload: Partial<Faq>): Promise<Faq> {
    const entity = await this.faqRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.faqRepository.save(
      this.faqRepository.create(
        FaqMapper.toPersistence({
          ...FaqMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return FaqMapper.toDomain(updatedEntity);
  }

  async remove(id: Faq['id']): Promise<void> {
    await this.faqRepository.delete(id);
  }
}
