import { Controller, UseGuards } from '@nestjs/common';
import { GpsClicksService } from './gps-clicks.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Gpsclicks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'gps-clicks',
  version: '1',
})
export class GpsClicksController {
  constructor(private readonly gpsClicksService: GpsClicksService) {}
}
