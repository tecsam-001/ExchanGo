import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateGpsClickDto } from './dto/create-gps-click.dto';
import { GpsClickRepository } from './infrastructure/persistence/gps-click.repository';
import { OfficesService } from '../offices/offices.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class GpsClicksService {
  constructor(
    // Dependencies here
    private readonly officesService: OfficesService,
    private readonly usersService: UsersService,
    private readonly gpsClickRepository: GpsClickRepository,
  ) {}

  async create(createGpsClickDto: CreateGpsClickDto) {
    // Do not remove comment below.
    // <creating-property />

    const office = await this.officesService.findById(
      createGpsClickDto.officeId,
    );

    if (!office) {
      throw new Error('Office not found');
    }

    const user = createGpsClickDto.userId
      ? await this.usersService.findById(createGpsClickDto.userId)
      : null;

    if (!user) {
      throw new Error('User not found');
    }

    return this.gpsClickRepository.create({
      office,
      user,
      ipAddress: createGpsClickDto.ipAddress,
    });
  }

  async getGpsClicksCount(
    officeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return this.gpsClickRepository.getGpsClicksCount(
      officeId,
      startDate,
      endDate,
    );
  }

  async getGpsClicksCountForAllOffices(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return this.gpsClickRepository.getGpsClicksCountForAllOffices(
      startDate,
      endDate,
    );
  }

  async getBulkGpsClicksCounts(
    officeIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, number>> {
    return this.gpsClickRepository.getBulkGpsClicksCounts(
      officeIds,
      startDate,
      endDate,
    );
  }
}
