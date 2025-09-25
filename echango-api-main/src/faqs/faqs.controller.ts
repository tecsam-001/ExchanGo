import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { CreateMyFaqDto, CreateMyFaqsDto } from './dto/create-my-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiOperation,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Faq } from './domain/faq';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllFaqsDto } from './dto/find-all-faqs.dto';

@ApiTags('Faqs')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'faqs',
  version: '1',
})
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Post()
  @ApiCreatedResponse({
    type: Faq,
  })
  create(@Body() createFaqDto: CreateFaqDto) {
    return this.faqsService.create(createFaqDto);
  }

  // Authenticated user endpoints for their office FAQs (must come before generic :id routes)
  @Get('me')
  @ApiOkResponse({
    type: InfinityPaginationResponse(Faq),
  })
  async getMyOfficeFaqs(
    @Request() request,
    @Query() query: FindAllFaqsDto,
  ): Promise<InfinityPaginationResponseDto<Faq>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.faqsService.getMyFaqsWithPagination(request.user.id, {
        page,
        limit,
      }),
      { page, limit },
    );
  }

  @Post('me/bulk')
  @ApiOperation({
    summary: 'Create multiple FAQs for authenticated user office',
    description:
      "Allows office owners to create multiple FAQs in a single request. All FAQs will be associated with the authenticated user's office.",
  })
  @ApiCreatedResponse({
    type: [Faq],
    description: 'Successfully created FAQs',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation errors',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated or office not found',
  })
  @HttpCode(HttpStatus.CREATED)
  createMyOfficeFaqs(
    @Request() request,
    @Body() createMyFaqsDto: CreateMyFaqsDto,
  ) {
    return this.faqsService.createMyFaqs(request.user.id, createMyFaqsDto);
  }

  @Post('me')
  @ApiCreatedResponse({
    type: Faq,
  })
  @HttpCode(HttpStatus.CREATED)
  createMyOfficeFaq(
    @Request() request,
    @Body() createMyFaqDto: CreateMyFaqDto,
  ) {
    return this.faqsService.createMyFaq(request.user.id, createMyFaqDto);
  }

  @Patch('me/:id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Faq,
  })
  updateMyOfficeFaq(
    @Request() request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFaqDto: UpdateFaqDto,
  ) {
    return this.faqsService.updateMyFaq(request.user.id, id, updateFaqDto);
  }

  @Delete('me/:id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMyOfficeFaq(
    @Request() request,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.faqsService.removeMyFaq(request.user.id, id);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(Faq),
  })
  async findAll(
    @Query() query: FindAllFaqsDto,
  ): Promise<InfinityPaginationResponseDto<Faq>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.faqsService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Faq,
  })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.faqsService.findById(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Faq,
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFaqDto: UpdateFaqDto,
  ) {
    return this.faqsService.update(id, updateFaqDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.faqsService.remove(id);
  }
}
