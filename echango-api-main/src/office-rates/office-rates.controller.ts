import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OfficeRatesService } from './office-rates.service';

interface AuthenticatedRequest {
  user: {
    id: string;
  };
}
import { CreateOfficeRateDto } from './dto/create-office-rate.dto';
import { UpdateOfficeRateDto } from './dto/update-office-rate.dto';
import { BulkUpdateOfficeRatesDto } from './dto/bulk-update-office-rates.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { OfficeRate } from './domain/office-rate';
import { AuthGuard } from '@nestjs/passport';
// import {
//   InfinityPaginationResponse,
//   InfinityPaginationResponseDto,
// } from '../utils/dto/infinity-pagination-response.dto';
// import { infinityPagination } from '../utils/infinity-pagination';
// import { FindAllOfficeRatesDto } from './dto/find-all-office-rates.dto';

@ApiTags('Officerates')
@Controller({
  path: 'office-rates',
  version: '1',
})
export class OfficeRatesController {
  constructor(private readonly officeRatesService: OfficeRatesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiCreatedResponse({
    type: OfficeRate,
  })
  create(
    @Body() createOfficeRateDto: CreateOfficeRateDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.officeRatesService.create({
      ...createOfficeRateDto,
      owner: req.user.id,
    });
  }

  @Post('rate-management')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('anonymous'))
  @ApiCreatedResponse({
    type: OfficeRate,
  })
  createRateManagement(
    @Body() createOfficeRateDto: CreateOfficeRateDto,
    @Request() req: AuthenticatedRequest,
  ) {
    console.log(req);
    return this.officeRatesService.createRateManagement({
      ...createOfficeRateDto,
      officeId: createOfficeRateDto.officeId,
    });
  }

  // @Get()
  // @ApiOkResponse({
  //   type: InfinityPaginationResponse(OfficeRate),
  // })
  // async findAll(
  //   @Query() query: FindAllOfficeRatesDto,
  // ): Promise<InfinityPaginationResponseDto<OfficeRate>> {
  //   const page = query?.page ?? 1;
  //   let limit = query?.limit ?? 10;
  //   if (limit > 50) {
  //     limit = 50;
  //   }

  //   return infinityPagination(
  //     await this.officeRatesService.findAllWithPagination({
  //       paginationOptions: {
  //         page,
  //         limit,
  //       },
  //     }),
  //     { page, limit },
  //   );
  // }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getOfficeRatesByOfficeId(@Request() req: AuthenticatedRequest) {
    return this.officeRatesService.getOfficeRatesByOfficeId(req.user.id);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: OfficeRate,
  })
  findById(@Param('id') id: string) {
    return this.officeRatesService.findById(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: OfficeRate,
  })
  update(
    @Param('id') id: string,
    @Body() updateOfficeRateDto: UpdateOfficeRateDto,
  ) {
    return this.officeRatesService.update(id, updateOfficeRateDto);
  }

  @Patch('rate-management/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('anonymous'))
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: OfficeRate,
  })
  updateRateManagement(
    @Param('id') id: string,
    @Body() updateOfficeRateDto: UpdateOfficeRateDto,
  ) {
    return this.officeRatesService.update(id, updateOfficeRateDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.officeRatesService.remove(id);
  }

  @Post('bulk-update')
  @ApiOperation({
    summary: 'Bulk update office rates for multiple offices',
    description:
      'Updates or creates currency rates for multiple offices identified by their slugs. If a rate exists for a currency, it will be updated. If not, a new rate will be created.',
  })
  @ApiCreatedResponse({
    description: 'Bulk update completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        results: {
          type: 'object',
          properties: {
            updated: { type: 'number' },
            created: { type: 'number' },
            errors: { type: 'number' },
          },
        },
        details: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              officeSlug: { type: 'string' },
              currency: { type: 'string' },
              action: { type: 'string', enum: ['updated', 'created', 'error'] },
              message: { type: 'string' },
            },
          },
        },
      },
    },
  })
  bulkUpdateOfficeRates(@Body() bulkUpdateDto: BulkUpdateOfficeRatesDto) {
    return this.officeRatesService.bulkUpdateOfficeRates(bulkUpdateDto);
  }
}
