import { Module } from '@nestjs/common';
import { ProfileViewRepository } from '../profile-view.repository';
import { ProfileViewRelationalRepository } from './repositories/profile-view.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileViewEntity } from './entities/profile-view.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileViewEntity])],
  providers: [
    {
      provide: ProfileViewRepository,
      useClass: ProfileViewRelationalRepository,
    },
  ],
  exports: [ProfileViewRepository],
})
export class RelationalProfileViewPersistenceModule {}
