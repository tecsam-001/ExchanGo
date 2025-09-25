import { Controller, Get, Param, Query } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { Currency } from './domain/currency';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllCurrenciesDto } from './dto/find-all-currencies.dto';

@ApiTags('Currencies')
@Controller({
  path: 'currencies',
  version: '1',
})
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(Currency),
  })
  async findAll(
    @Query() query: FindAllCurrenciesDto,
  ): Promise<InfinityPaginationResponseDto<Currency>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.currenciesService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @Get('/:code')
  @ApiParam({
    name: 'code',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Currency,
  })
  findByCode(@Param('code') code: Currency['code']) {
    return this.currenciesService.findByCode(code);
  }

  @Get('/search/:query')
  @ApiParam({
    name: 'query',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Currency,
  })
  searchByCode(@Param('query') query: string) {
    return this.currenciesService.searchByCode(query);
  }

  // @Get(':id')
  // @ApiParam({
  //   name: 'id',
  //   type: String,
  //   required: true,
  // })
  // @ApiOkResponse({
  //   type: Currency,
  // })
  // findById(@Param('id') id: string) {
  //   return this.currenciesService.findById(id);
  // }
}
