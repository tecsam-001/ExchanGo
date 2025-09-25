import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreatePhoneCallDto } from './dto/create-phone-call.dto';
import { PhoneCallRepository } from './infrastructure/persistence/phone-call.repository';
import { OfficesService } from '../offices/offices.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class PhoneCallsService {
  constructor(
    // Dependencies here
    private readonly phoneCallRepository: PhoneCallRepository,
    private readonly officesService: OfficesService,
    private readonly usersService: UsersService,
  ) {}

  async create(createPhoneCallDto: CreatePhoneCallDto) {
    // Do not remove comment below.
    // <creating-property />

    const office = await this.officesService.findById(
      createPhoneCallDto.officeId,
    );

    if (!office) {
      throw new Error('Office not found');
    }

    const caller = createPhoneCallDto.callerId
      ? await this.usersService.findById(createPhoneCallDto.callerId)
      : null;

    if (!caller) {
      throw new Error('Caller not found');
    }

    return this.phoneCallRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      office,
      caller,
      phoneNumber: createPhoneCallDto.phoneNumber,
      phoneType: createPhoneCallDto.phoneType,
    });
  }

  async getPhoneCallsCount(
    officeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return this.phoneCallRepository.getPhoneCallsCount(
      officeId,
      startDate,
      endDate,
    );
  }

  async getPhoneCallsCountForAllOffices(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return this.phoneCallRepository.getPhoneCallsCountForAllOffices(
      startDate,
      endDate,
    );
  }

  async getBulkPhoneCallsCounts(
    officeIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, number>> {
    return this.phoneCallRepository.getBulkPhoneCallsCounts(
      officeIds,
      startDate,
      endDate,
    );
  }
}
