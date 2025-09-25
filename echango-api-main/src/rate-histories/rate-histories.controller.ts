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
  Query,
} from '@nestjs/common';
import { RateHistoriesService } from './rate-histories.service';
import { CreateRateHistoryDto } from './dto/create-rate-history.dto';
import { UpdateRateHistoryDto } from './dto/update-rate-history.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RateHistory } from './domain/rate-history';
import { AuthGuard } from '@nestjs/passport';
// import {
//   InfinityPaginationResponse,
//   InfinityPaginationResponseDto,
// } from '../utils/dto/infinity-pagination-response.dto';
// import { infinityPagination } from '../utils/infinity-pagination';
// import { FindAllRateHistoriesDto } from './dto/find-all-rate-histories.dto';
import { TimePeriod } from './dto/get-rate-histories-query.dto';

@ApiTags('Ratehistories')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'rate-histories',
  version: '1',
})
export class RateHistoriesController {
  constructor(private readonly rateHistoriesService: RateHistoriesService) {}

  @Post()
  @ApiCreatedResponse({
    type: RateHistory,
  })
  create(@Body() createRateHistoryDto: CreateRateHistoryDto) {
    return this.rateHistoriesService.create(createRateHistoryDto);
  }

  // @Get()
  // @ApiOkResponse({
  //   type: InfinityPaginationResponse(RateHistory),
  // })
  // async findAll(
  //   @Query() query: FindAllRateHistoriesDto,
  // ): Promise<InfinityPaginationResponseDto<RateHistory>> {
  //   const page = query?.page ?? 1;
  //   let limit = query?.limit ?? 10;
  //   if (limit > 50) {
  //     limit = 50;
  //   }

  //   return infinityPagination(
  //     await this.rateHistoriesService.findAllWithPagination({
  //       paginationOptions: {
  //         page,
  //         limit,
  //       },
  //     }),
  //     { page, limit },
  //   );
  // }

  @Get()
  @ApiOkResponse({
    type: [RateHistory],
    description: 'Get rate histories filtered by time period',
  })
  async getRateHistoriesByOfficeId(
    @Request() req,
    @Query('timePeriod') timePeriod: TimePeriod = TimePeriod.ALL_HISTORY,
  ): Promise<RateHistory[]> {
    return this.rateHistoriesService.getRateHistoriesByOfficeId(
      req.user.id,
      timePeriod,
    );
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: RateHistory,
  })
  findById(@Param('id') id: string) {
    return this.rateHistoriesService.findById(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: RateHistory,
  })
  update(
    @Param('id') id: string,
    @Body() updateRateHistoryDto: UpdateRateHistoryDto,
  ) {
    return this.rateHistoriesService.update(id, updateRateHistoryDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.rateHistoriesService.remove(id);
  }
}
