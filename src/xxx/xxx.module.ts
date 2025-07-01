import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { XxxController } from './xxx.controller';
import { XxxService } from './xxx.service';
import { APIConfig } from '../utils/API';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [HttpModule],
  controllers: [XxxController],
  providers: [XxxService, APIConfig,PrismaService],
  exports: [XxxService],
})
export class XxxModule {} 