import { Controller, UseGuards } from '@nestjs/common';
import { PhoneCallsService } from './phone-calls.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Phonecalls')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'phone-calls',
  version: '1',
})
export class PhoneCallsController {
  constructor(private readonly phoneCallsService: PhoneCallsService) {}
}
