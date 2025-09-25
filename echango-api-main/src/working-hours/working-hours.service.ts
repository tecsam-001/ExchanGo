import {
  BadRequestException,
  // common
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWorkingHourDto } from './dto/create-working-hour.dto';
import {
  UpdateWorkingHourDto,
  UpdateWorkingHoursDto,
} from './dto/update-working-hour.dto';
import { WorkingHourRepository } from './infrastructure/persistence/working-hour.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { WorkingHour } from './domain/working-hour';
import { OfficesService } from '../offices/offices.service';
import { OfficeCreatedEvent } from '../events/office-created.event';
import { OnEvent } from '@nestjs/event-emitter';
import { BulkUpdateWorkingHoursDto } from './dto/bulk-update-working-hours.dto';

@Injectable()
export class WorkingHoursService {
  constructor(
    // Dependencies here
    private readonly workingHourRepository: WorkingHourRepository,
    private readonly officesService: OfficesService,
  ) {}

  async create(createWorkingHourDto: CreateWorkingHourDto) {
    // Do not remove comment below.
    // <creating-property />

    const officeExists = await this.officesService.findById(
      createWorkingHourDto.officeId,
    );

    if (!officeExists) {
      throw new NotFoundException(
        `Office with id ${createWorkingHourDto.officeId} not found`,
      );
    }

    console.log(createWorkingHourDto);

    return this.workingHourRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      dayOfWeek: createWorkingHourDto.dayOfWeek,
      isActive: createWorkingHourDto.isActive,
      fromTime: createWorkingHourDto.fromTime || '00:00',
      toTime: createWorkingHourDto.toTime || '00:00',
      hasBreak: createWorkingHourDto.hasBreak || false,
      breakFromTime: createWorkingHourDto.breakFromTime || '00:00',
      breakToTime: createWorkingHourDto.breakToTime || '00:00',
      officeId: createWorkingHourDto.officeId,
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.workingHourRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: WorkingHour['id']) {
    return this.workingHourRepository.findById(id);
  }

  findByIds(ids: WorkingHour['id'][]) {
    return this.workingHourRepository.findByIds(ids);
  }

  async update(
    id: WorkingHour['id'],
    updateWorkingHourDto: UpdateWorkingHourDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    // Add validation to ensure we have data to update
    if (
      !updateWorkingHourDto ||
      Object.keys(updateWorkingHourDto).length === 0
    ) {
      throw new BadRequestException('No update data provided');
    }

    // Log the update data for debugging
    console.log('Updating working hour with ID:', id);
    console.log('Update data:', updateWorkingHourDto);

    const result = await this.workingHourRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
      ...updateWorkingHourDto,
    });

    // Log the result for debugging
    console.log('Update result:', result);

    return result;
  }

  remove(id: WorkingHour['id']) {
    return this.workingHourRepository.remove(id);
  }

  @OnEvent('office.created', { async: true })
  async handleOfficeCreated(event: OfficeCreatedEvent) {
    const office = event.office;
    // create working hours for the office for each day of the week
    const daysOfWeek = [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ];
    for (const dayOfWeek of daysOfWeek) {
      console.log(dayOfWeek);
      await this.create({
        officeId: office.id,
        dayOfWeek,
        isActive: true,
        hasBreak: false,
      });
    }
  }

  async bulkUpdateWorkingHours(
    officeId: string,
    updateDto: BulkUpdateWorkingHoursDto,
  ) {
    return this.workingHourRepository.bulkUpdateWorkingHours(
      officeId,
      updateDto,
    );
  }

  async updateWorkingHours(
    officeId: string,
    updateDto: UpdateWorkingHoursDto,
  ): Promise<WorkingHour[]> {
    console.log('updateDto', updateDto);

    // Verify office exists
    const office = await this.officesService.findById(officeId);
    if (!office) {
      throw new NotFoundException(`Office with ID ${officeId} not found`);
    }

    const updatedWorkingHours: WorkingHour[] = [];

    // Process each working hour update
    for (const workingHourUpdate of updateDto.workingHours) {
      console.log(
        `Processing update for ${workingHourUpdate.dayOfWeek}:`,
        workingHourUpdate,
      );

      const existingWorkingHoursArray =
        await this.workingHourRepository.findWorkingHoursByOfficeIdAndDayOfWeek(
          officeId,
          workingHourUpdate.dayOfWeek,
        );

      if (
        !existingWorkingHoursArray ||
        existingWorkingHoursArray.length === 0
      ) {
        throw new NotFoundException(
          `Working hour for ${workingHourUpdate.dayOfWeek} not found for office ${officeId}`,
        );
      }

      const existingWorkingHour = existingWorkingHoursArray[0];
      console.log('Existing working hour before update:', existingWorkingHour);

      // Validate break times if hasBreak is true
      if (
        workingHourUpdate.hasBreak !== undefined &&
        workingHourUpdate.hasBreak
      ) {
        if (
          !workingHourUpdate.breakFromTime ||
          !workingHourUpdate.breakToTime
        ) {
          throw new BadRequestException(
            `Break times are required when hasBreak is true for ${workingHourUpdate.dayOfWeek}`,
          );
        }

        const fromTime =
          workingHourUpdate.fromTime || existingWorkingHour.fromTime;
        const toTime = workingHourUpdate.toTime || existingWorkingHour.toTime;

        if (
          !(
            this.isTimeAfter(workingHourUpdate.breakFromTime, fromTime) &&
            this.isTimeBefore(workingHourUpdate.breakToTime, toTime) &&
            this.isTimeBefore(
              workingHourUpdate.breakFromTime,
              workingHourUpdate.breakToTime,
            )
          )
        ) {
          throw new BadRequestException(
            `Break times must be within working hours for ${workingHourUpdate.dayOfWeek}`,
          );
        }
      }

      // Prepare clean update payload - only include defined fields
      const updatePayload: Partial<WorkingHour> = {};

      if (workingHourUpdate.isActive !== undefined) {
        updatePayload.isActive = workingHourUpdate.isActive;
      }
      if (workingHourUpdate.fromTime !== undefined) {
        updatePayload.fromTime = workingHourUpdate.fromTime;
      }
      if (workingHourUpdate.toTime !== undefined) {
        updatePayload.toTime = workingHourUpdate.toTime;
      }
      if (workingHourUpdate.hasBreak !== undefined) {
        updatePayload.hasBreak = workingHourUpdate.hasBreak;

        // Clear break times if hasBreak is set to false
        if (workingHourUpdate.hasBreak === false) {
          updatePayload.breakFromTime = undefined;
          updatePayload.breakToTime = undefined;
        }
      }
      if (workingHourUpdate.breakFromTime !== undefined) {
        updatePayload.breakFromTime = workingHourUpdate.breakFromTime;
      }
      if (workingHourUpdate.breakToTime !== undefined) {
        updatePayload.breakToTime = workingHourUpdate.breakToTime;
      }

      console.log('Update payload being sent:', updatePayload);

      // Call the correct update method with the working hour ID
      const savedWorkingHour = await this.update(
        existingWorkingHour.id,
        updatePayload as UpdateWorkingHourDto,
      );

      console.log('Saved working hour result:', savedWorkingHour);

      if (savedWorkingHour) {
        updatedWorkingHours.push(savedWorkingHour);
      } else {
        console.warn(
          `Failed to update working hour for ${workingHourUpdate.dayOfWeek}`,
        );
      }
    }

    console.log('Final updated working hours:', updatedWorkingHours);
    return updatedWorkingHours;
  }

  async findWorkingHoursByOfficeId(officeId: string): Promise<WorkingHour[]> {
    return this.workingHourRepository.findWorkingHoursByOfficeId(officeId);
  }

  async findWorkingHoursByUserId(userId: string): Promise<WorkingHour[]> {
    const office = await this.officesService.getAuthenticatedUserOffice(userId);

    if (!office) {
      throw new NotFoundException('No office found for the authenticated user');
    }

    return this.workingHourRepository.findWorkingHoursByOfficeId(office.id);
  }

  async updateWorkingHoursByUserId(
    userId: string,
    updateDto: UpdateWorkingHoursDto,
  ): Promise<WorkingHour[]> {
    const office = await this.officesService.getAuthenticatedUserOffice(userId);

    if (!office) {
      throw new NotFoundException('No office found for the authenticated user');
    }

    return this.updateWorkingHours(office.id, updateDto);
  }

  // Helper method to compare times
  private isTimeAfter(time1: string, time2: string): boolean {
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);

    return hours1 > hours2 || (hours1 === hours2 && minutes1 >= minutes2);
  }

  private isTimeBefore(time1: string, time2: string): boolean {
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);

    return hours1 < hours2 || (hours1 === hours2 && minutes1 <= minutes2);
  }
}
