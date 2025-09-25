import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { WorkingHour } from '../../domain/working-hour';
import { BulkUpdateWorkingHoursDto } from '../../dto/bulk-update-working-hours.dto';

export abstract class WorkingHourRepository {
  abstract create(
    data: Omit<WorkingHour, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<WorkingHour>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<WorkingHour[]>;

  abstract findById(id: WorkingHour['id']): Promise<NullableType<WorkingHour>>;

  abstract findByIds(ids: WorkingHour['id'][]): Promise<WorkingHour[]>;

  abstract update(
    id: WorkingHour['id'],
    payload: DeepPartial<WorkingHour>,
  ): Promise<WorkingHour | null>;

  abstract remove(id: WorkingHour['id']): Promise<void>;

  abstract bulkUpdateWorkingHours(
    officeId: string,
    updateDto: BulkUpdateWorkingHoursDto,
  ): Promise<WorkingHour[]>;

  abstract findWorkingHoursByOfficeIdAndDayOfWeek(
    officeId: string,
    dayOfWeek: string,
  ): Promise<WorkingHour[]>;

  abstract findWorkingHoursByOfficeId(officeId: string): Promise<WorkingHour[]>;
}
