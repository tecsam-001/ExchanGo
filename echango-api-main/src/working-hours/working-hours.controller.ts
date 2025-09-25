import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  // Query,
  Request,
} from '@nestjs/common';
import { WorkingHoursService } from './working-hours.service';
import { CreateWorkingHourDto } from './dto/create-working-hour.dto';
import { UpdateWorkingHoursDto } from './dto/update-working-hour.dto';

import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WorkingHour } from './domain/working-hour';
import { AuthGuard } from '@nestjs/passport';
// import {
//   InfinityPaginationResponse,
//   InfinityPaginationResponseDto,
// } from '../utils/dto/infinity-pagination-response.dto';
// import { infinityPagination } from '../utils/infinity-pagination';
// import { FindAllWorkingHoursDto } from './dto/find-all-working-hours.dto';

@ApiTags('Workinghours')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'working-hours',
  version: '1',
})
export class WorkingHoursController {
  constructor(private readonly workingHoursService: WorkingHoursService) {}

  @Post()
  @ApiCreatedResponse({
    type: WorkingHour,
  })
  create(@Body() createWorkingHourDto: CreateWorkingHourDto) {
    return this.workingHoursService.create(createWorkingHourDto);
  }

  // @Get()
  // @ApiOkResponse({
  //   type: InfinityPaginationResponse(WorkingHour),
  // })
  // async findAll(
  //   @Query() query: FindAllWorkingHoursDto,
  // ): Promise<InfinityPaginationResponseDto<WorkingHour>> {
  //   const page = query?.page ?? 1;
  //   let limit = query?.limit ?? 10;
  //   if (limit > 50) {
  //     limit = 50;
  //   }

  //   return infinityPagination(
  //     await this.workingHoursService.findAllWithPagination({
  //       paginationOptions: {
  //         page,
  //         limit,
  //       },
  //     }),
  //     { page, limit },
  //   );
  // }

  @Get()
  @ApiOperation({ summary: 'Get working hours for authenticated user office' })
  @ApiOkResponse({
    type: [WorkingHour],
    description: 'Working hours for the authenticated user office',
  })
  @ApiResponse({ status: 404, description: 'Office not found for user' })
  async getMyOfficeWorkingHours(@Request() req: any) {
    return this.workingHoursService.findWorkingHoursByUserId(req.user.id);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: WorkingHour,
  })
  findById(@Param('id') id: string) {
    return this.workingHoursService.findById(id);
  }

  // @Patch(':id')
  // @ApiParam({
  //   name: 'id',
  //   type: String,
  //   required: true,
  // })
  // @ApiOkResponse({
  //   type: WorkingHour,
  // })
  // update(
  //   @Param('id') id: string,
  //   @Body() updateWorkingHourDto: UpdateWorkingHourDto,
  // ) {
  //   return this.workingHoursService.update(id, updateWorkingHourDto);
  // }

  // @Delete(':id')
  // @ApiParam({
  //   name: 'id',
  //   type: String,
  //   required: true,
  // })
  // remove(@Param('id') id: string) {
  //   return this.workingHoursService.remove(id);
  // }

  // @Put(':officeId/working-hours')
  // async updateWorkingHours(
  //   @Param('officeId') officeId: string,
  //   @Body() updateDto: BulkUpdateWorkingHoursDto,
  // ) {
  //   try {
  //     const updatedWorkingHours =
  //       await this.workingHoursService.bulkUpdateWorkingHours(
  //         officeId,
  //         updateDto,
  //       );

  //     return updatedWorkingHours;
  //   } catch {
  //     throw new BadRequestException('Failed to update working hours');
  //   }
  // }

  @Patch()
  @ApiOperation({
    summary: 'Update working hours for authenticated user office',
  })
  @ApiResponse({
    status: 200,
    description: 'Working hours updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Office not found for user' })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  async updateMyOfficeWorkingHours(
    @Request() req: any,
    @Body() updateDto: UpdateWorkingHoursDto,
  ) {
    const updatedWorkingHours =
      await this.workingHoursService.updateWorkingHoursByUserId(
        req.user.id,
        updateDto,
      );

    return {
      success: true,
      message: 'Working hours updated successfully',
      data: updatedWorkingHours,
    };
  }
}
