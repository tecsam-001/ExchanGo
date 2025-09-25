import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { WorkingHourEntity } from '../entities/working-hour.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { WorkingHour } from '../../../../domain/working-hour';
import { WorkingHourRepository } from '../../working-hour.repository';
import { WorkingHourMapper } from '../mappers/working-hour.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { BulkUpdateWorkingHoursDto } from '../../../../dto/bulk-update-working-hours.dto';

@Injectable()
export class WorkingHourRelationalRepository implements WorkingHourRepository {
  constructor(
    @InjectRepository(WorkingHourEntity)
    private readonly workingHourRepository: Repository<WorkingHourEntity>,
  ) {}

  async create(data: WorkingHour): Promise<WorkingHour> {
    const persistenceModel = WorkingHourMapper.toPersistence(data);
    const newEntity = await this.workingHourRepository.save(
      this.workingHourRepository.create(persistenceModel),
    );
    return WorkingHourMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<WorkingHour[]> {
    const entities = await this.workingHourRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => WorkingHourMapper.toDomain(entity));
  }

  async findById(id: WorkingHour['id']): Promise<NullableType<WorkingHour>> {
    const entity = await this.workingHourRepository.findOne({
      where: { id },
    });

    return entity ? WorkingHourMapper.toDomain(entity) : null;
  }

  async findByIds(ids: WorkingHour['id'][]): Promise<WorkingHour[]> {
    const entities = await this.workingHourRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => WorkingHourMapper.toDomain(entity));
  }

  async update(
    id: WorkingHour['id'],
    payload: Partial<WorkingHour>,
  ): Promise<WorkingHour> {
    const entity = await this.workingHourRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.workingHourRepository.save(
      this.workingHourRepository.create(
        WorkingHourMapper.toPersistence({
          ...WorkingHourMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return WorkingHourMapper.toDomain(updatedEntity);
  }

  async remove(id: WorkingHour['id']): Promise<void> {
    await this.workingHourRepository.delete(id);
  }

  async bulkUpdateWorkingHours(
    officeId: string,
    updateDto: BulkUpdateWorkingHoursDto,
  ): Promise<WorkingHourEntity[]> {
    // Use transaction to ensure data consistency
    return await this.workingHourRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const updatedWorkingHours: WorkingHourEntity[] = [];

        for (const workingHourData of updateDto.workingHours) {
          // Find existing working hour for this day
          const existingWorkingHour = await transactionalEntityManager.findOne(
            WorkingHourEntity,
            {
              where: {
                officeId,
                dayOfWeek: workingHourData.dayOfWeek,
              },
            },
          );

          if (existingWorkingHour) {
            // Update existing record
            Object.assign(existingWorkingHour, {
              isActive: workingHourData.isActive,
              fromTime: workingHourData.fromTime || '00:00:00',
              toTime: workingHourData.toTime || '00:00:00',
              hasBreak: workingHourData.hasBreak || false,
              breakFromTime: workingHourData.breakFromTime || '00:00:00',
              breakToTime: workingHourData.breakToTime || null,
            });

            const savedWorkingHour = await transactionalEntityManager.save(
              WorkingHourEntity,
              existingWorkingHour,
            );
            updatedWorkingHours.push(savedWorkingHour);
          }
        }

        return updatedWorkingHours;
      },
    );
  }

  async findWorkingHoursByOfficeIdAndDayOfWeek(
    officeId: string,
    dayOfWeek: string,
  ): Promise<WorkingHourEntity[]> {
    return await this.workingHourRepository.find({
      where: {
        officeId,
        dayOfWeek,
      },
    });
  }

  async findWorkingHoursByOfficeId(officeId: string): Promise<WorkingHour[]> {
    const entities = await this.workingHourRepository.find({
      where: {
        officeId,
      },
      order: {
        dayOfWeek: 'ASC',
      },
    });

    return entities.map((entity) => WorkingHourMapper.toDomain(entity));
  }
}
