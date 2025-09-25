import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UltraMsgService } from './ultramsg.service';

@Module({
  imports: [ConfigModule],
  providers: [UltraMsgService],
  exports: [UltraMsgService],
})
export class UltraMsgModule {}
