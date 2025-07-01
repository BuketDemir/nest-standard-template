import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';

@Controller()
export class AppController {
  @Get('health')
  @Public()
  @ApiResponse({ status: 200 })
  healthCheck(): { status: boolean, version: string } {
    return { status: true , version: '1.0.0'};
  }
}
