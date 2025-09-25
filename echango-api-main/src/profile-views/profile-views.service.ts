import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateProfileViewDto } from './dto/create-profile-view.dto';
import { ProfileViewRepository } from './infrastructure/persistence/profile-view.repository';
import { OfficesService } from '../offices/offices.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProfileViewsService {
  constructor(
    // Dependencies here
    private readonly profileViewRepository: ProfileViewRepository,
    private readonly officesService: OfficesService,
    private readonly usersService: UsersService,
  ) {}

  async create(createProfileViewDto: CreateProfileViewDto) {
    // Do not remove comment below.
    // <creating-property />

    const office = await this.officesService.findById(
      createProfileViewDto.officeId,
    );

    if (!office) {
      throw new Error('Office not found');
    }

    const viewer = createProfileViewDto.viewerId
      ? await this.usersService.findById(createProfileViewDto.viewerId)
      : null;

    if (!viewer) {
      throw new Error('Viewer not found');
    }

    return this.profileViewRepository.create({
      office,
      viewer,
      ipAddress: createProfileViewDto.ipAddress,
      userAgent: createProfileViewDto.userAgent,
      referrer: createProfileViewDto.referrer,
    });
  }

  async getProfileViewsCount(
    officeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return this.profileViewRepository.getProfileViewsCount(
      officeId,
      startDate,
      endDate,
    );
  }

  async getProfileViewsCountForAllOffices(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return this.profileViewRepository.getProfileViewsCountForAllOffices(
      startDate,
      endDate,
    );
  }

  async getBulkProfileViewsCounts(
    officeIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, number>> {
    return this.profileViewRepository.getBulkProfileViewsCounts(
      officeIds,
      startDate,
      endDate,
    );
  }
}
