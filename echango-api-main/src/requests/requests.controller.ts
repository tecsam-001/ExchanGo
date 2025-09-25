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
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RejectRequestDto } from './dto/reject-request.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from './domain/request';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllRequestsDto } from './dto/find-all-requests.dto';
import { RolesGuard } from '../roles/roles.guard';

@ApiTags('Requests')
@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({
  path: 'requests',
  version: '1',
})
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @ApiCreatedResponse({
    type: Request,
  })
  create(@Body() createRequestDto: CreateRequestDto) {
    return this.requestsService.create(createRequestDto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(Request),
  })
  async findAll(
    @Query() query: FindAllRequestsDto,
  ): Promise<InfinityPaginationResponseDto<Request>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.requestsService.findAllWithPagination({
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
    type: Request,
  })
  findById(@Param('id') id: string) {
    return this.requestsService.findById(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Request,
  })
  update(@Param('id') id: string, @Body() updateRequestDto: UpdateRequestDto) {
    return this.requestsService.update(id, updateRequestDto);
  }

  @Patch(':id/accept')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Request,
  })
  accept(@Param('id') id: string) {
    return this.requestsService.accept(id);
  }

  @Patch(':id/reject')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Request,
  })
  reject(@Param('id') id: string, @Body() rejectRequestDto: RejectRequestDto) {
    return this.requestsService.reject(id, rejectRequestDto);
  }

  @Patch(':id/hold')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Request,
  })
  hold(@Param('id') id: string) {
    return this.requestsService.hold(id);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.requestsService.remove(id);
  }
}
