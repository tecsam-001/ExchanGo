import { Controller, UseGuards } from '@nestjs/common';
import { ProfileViewsService } from './profile-views.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Profileviews')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'profile-views',
  version: '1',
})
export class ProfileViewsController {
  constructor(private readonly profileViewsService: ProfileViewsService) {}
}
