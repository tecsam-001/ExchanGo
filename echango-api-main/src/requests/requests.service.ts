import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RejectRequestDto } from './dto/reject-request.dto';
import { RequestRepository } from './infrastructure/persistence/request.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Request } from './domain/request';
import { OfficesService } from '../offices/offices.service';
import { RequestStatus } from './infrastructure/persistence/relational/entities/request.entity';
import { OfficeCreatedEvent } from '../events/office-created.event';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from '../mail/mail.service';

@Injectable()
export class RequestsService {
  constructor(
    // Dependencies here
    private readonly requestRepository: RequestRepository,
    private readonly officesService: OfficesService,
    private readonly mailService: MailService,
  ) {}

  async create(createRequestDto: CreateRequestDto) {
    // Do not remove comment below.
    // <creating-property />

    return this.requestRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      office: (await this.officesService.findById(createRequestDto.officeId))!,
      status: RequestStatus.REQUESTED,
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.requestRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Request['id']) {
    return this.requestRepository.findById(id);
  }

  findByIds(ids: Request['id'][]) {
    return this.requestRepository.findByIds(ids);
  }

  async update(
    id: Request['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateRequestDto: UpdateRequestDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.requestRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: Request['id']) {
    return this.requestRepository.remove(id);
  }

  async accept(id: Request['id']) {
    const request = await this.findById(id);
    if (!request) {
      throw new Error('Request not found');
    }
    await this.officesService.markOfficeAsVerified(request.office.id);

    // Send office approved email
    if (request.office.owner?.email) {
      await this.mailService.officeApproved({
        to: request.office.owner.email,
        data: {},
      });
    }

    return this.requestRepository.update(id, {
      status: RequestStatus.ACCEPTED,
    });
  }

  async reject(id: Request['id'], rejectRequestDto: RejectRequestDto) {
    const request = await this.findById(id);
    if (request && request.office.owner?.email) {
      // Send office rejected email
      await this.mailService.officeRejected({
        to: request.office.owner.email,
        data: {
          rejectReason: rejectRequestDto.rejectReason || 'No reason provided',
        },
      });
    }

    return this.requestRepository.update(id, {
      status: RequestStatus.REJECTED,
      rejectReason: rejectRequestDto.rejectReason,
      additionalMessage: rejectRequestDto.additionalMessage,
    });
  }

  async hold(id: Request['id']) {
    const request = await this.findById(id);
    if (!request) {
      throw new Error('Request not found');
    }

    return this.requestRepository.update(id, {
      status: RequestStatus.ON_HOLD,
    });
  }

  @OnEvent('office.created', { async: true })
  async handleOfficeCreated(event: OfficeCreatedEvent) {
    const office = event.office;

    // Send office registration received email
    if (office.owner?.email) {
      await this.mailService.officeRegistrationReceived({
        to: office.owner.email,
        data: {},
      });
    }

    // create request for the office
    await this.create({
      officeId: office.id,
    });
  }
}
