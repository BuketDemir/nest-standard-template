import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ZzzController } from './zzz.controller';
import { ZzzService } from './zzz.service';
import { APIConfig } from '../utils/API';

@Module({
  imports: [HttpModule],
  controllers: [ZzzController],
  providers: [ZzzService, APIConfig],
  exports: [ZzzService],
})
export class ZzzModule {} 