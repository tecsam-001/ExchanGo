import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RequestEntity } from '../entities/request.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Request } from '../../../../domain/request';
import { RequestRepository } from '../../request.repository';
import { RequestMapper } from '../mappers/request.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class RequestRelationalRepository implements RequestRepository {
  constructor(
    @InjectRepository(RequestEntity)
    private readonly requestRepository: Repository<RequestEntity>,
  ) {}

  async create(data: Request): Promise<Request> {
    const persistenceModel = RequestMapper.toPersistence(data);
    const newEntity = await this.requestRepository.save(
      this.requestRepository.create(persistenceModel),
    );
    return RequestMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Request[]> {
    const entities = await this.requestRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => RequestMapper.toDomain(entity));
  }

  async findById(id: Request['id']): Promise<NullableType<Request>> {
    const entity = await this.requestRepository.findOne({
      where: { id },
    });

    return entity ? RequestMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Request['id'][]): Promise<Request[]> {
    const entities = await this.requestRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => RequestMapper.toDomain(entity));
  }

  async update(id: Request['id'], payload: Partial<Request>): Promise<Request> {
    const entity = await this.requestRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.requestRepository.save(
      this.requestRepository.create(
        RequestMapper.toPersistence({
          ...RequestMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return RequestMapper.toDomain(updatedEntity);
  }

  async remove(id: Request['id']): Promise<void> {
    await this.requestRepository.delete(id);
  }
}
