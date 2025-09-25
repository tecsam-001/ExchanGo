import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateFaqDto } from './dto/create-faq.dto';
import { CreateMyFaqDto, CreateMyFaqsDto } from './dto/create-my-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { FaqRepository } from './infrastructure/persistence/faq.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Faq } from './domain/faq';
import { OfficesService } from 'src/offices/offices.service';
import { Office } from 'src/offices/domain/office';
import { User } from 'src/users/domain/user';

@Injectable()
export class FaqsService {
  constructor(
    // Dependencies here
    private readonly faqRepository: FaqRepository,
    private readonly officesService: OfficesService,
  ) {}

  async create(createFaqDto: CreateFaqDto) {
    // Do not remove comment below.
    // <creating-property />

    const office = await this.officesService.findById(createFaqDto.officeId);

    return this.faqRepository.create({
      ...createFaqDto,
      office: office as Office,
      isActive: true,
      // Do not remove comment below.
      // <creating-property-payload />
    });
  }

  async createMyFaq(userId: User['id'], createMyFaqDto: CreateMyFaqDto) {
    const office = await this.officesService.getAuthenticatedUserOffice(userId);

    if (!office) {
      throw new Error('Office not found for authenticated user');
    }

    return this.faqRepository.create({
      ...createMyFaqDto,
      office: office as Office,
      isActive: true,
    });
  }

  async createMyFaqs(userId: User['id'], createMyFaqsDto: CreateMyFaqsDto) {
    const office = await this.officesService.getAuthenticatedUserOffice(userId);

    if (!office) {
      throw new Error('Office not found for authenticated user');
    }

    const faqsData = createMyFaqsDto.faqs.map((faqDto) => ({
      ...faqDto,
      office: office as Office,
      isActive: true,
    }));

    return this.faqRepository.createMany(faqsData);
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.faqRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  async getMyFaqs(userId: User['id']): Promise<Faq[]> {
    const office = await this.officesService.getAuthenticatedUserOffice(userId);

    if (!office) {
      throw new Error('Office not found for authenticated user');
    }

    return this.faqRepository.findByOfficeId(office.id);
  }

  async getMyFaqsWithPagination(
    userId: User['id'],
    paginationOptions: IPaginationOptions,
  ): Promise<Faq[]> {
    const office = await this.officesService.getAuthenticatedUserOffice(userId);

    if (!office) {
      throw new Error('Office not found for authenticated user');
    }

    return this.faqRepository.findByOfficeIdWithPagination({
      officeId: office.id,
      paginationOptions,
    });
  }

  findById(id: Faq['id']) {
    return this.faqRepository.findById(id);
  }

  findByIds(ids: Faq['id'][]) {
    return this.faqRepository.findByIds(ids);
  }

  async update(
    id: Faq['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateFaqDto: UpdateFaqDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.faqRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  async updateMyFaq(
    userId: User['id'],
    id: Faq['id'],
    updateFaqDto: UpdateFaqDto,
  ) {
    const office = await this.officesService.getAuthenticatedUserOffice(userId);

    if (!office) {
      throw new Error('Office not found for authenticated user');
    }

    // First, verify that the FAQ belongs to the user's office
    const faq = await this.faqRepository.findById(id);
    if (!faq) {
      throw new Error('FAQ not found');
    }

    if (!faq.office || faq.office.id !== office.id) {
      throw new Error('FAQ does not belong to your office');
    }

    return this.faqRepository.update(id, updateFaqDto);
  }

  remove(id: Faq['id']) {
    return this.faqRepository.remove(id);
  }

  async removeMyFaq(userId: User['id'], id: Faq['id']) {
    const office = await this.officesService.getAuthenticatedUserOffice(userId);

    if (!office) {
      throw new Error('Office not found for authenticated user');
    }

    // First, verify that the FAQ belongs to the user's office
    const faq = await this.faqRepository.findById(id);
    if (!faq) {
      throw new Error('FAQ not found');
    }

    if (!faq.office || faq.office.id !== office.id) {
      throw new Error('FAQ does not belong to your office');
    }

    return this.faqRepository.remove(id);
  }
}
