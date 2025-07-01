import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { GlobalResponse } from '../types/GlobalResponse';
import {
  DtoXXXRequest,
} from '../dto/xxx/dtoRequest';
import { XxxService } from './xxx.service';
import { DtoGlobalResponse } from 'src/dto/dtoGlobalResponse';
import { Response } from 'express';
import { Observable } from 'rxjs';


@ApiTags('xxx')
@Controller('xxx')
export class XxxController {
  constructor(private readonly xxxService: XxxService,

  ) {}

  @Post('/qna')
  @HttpCode(200)
  @ApiSecurity('x-api-key')
  @ApiResponse({ status: 200, description: 'OK', type: DtoGlobalResponse })
  async xxxQNA(
    @Body() request: DtoXXXRequest,
    @Res() res: Response
  ): Promise<void | GlobalResponse> {
    try {
      if (!request.model) {
        return {
          status: false,
          message: 'Model Required',
          data: {},
        };
      }

      const response = await this.xxxService.qna(request);
      
      // Stream response ise
      if (response instanceof Observable) {
        console.log('Stream response detected in controller');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');
        
        response.subscribe({
          next: (chunk) => {
            console.log('Sending chunk:', chunk);
            res.write(JSON.stringify(chunk) + '\n');
          },
          error: (error) => {
            console.error('Stream Error in controller:', error);
            res.end();
          },
          complete: () => {
            console.log('Stream completed in controller');
            res.end();
          }
        });
        return;
      }

      // Normal response ise
      if (!response.status) {
        return {
          status: false,
          message: 'Command Send Failed',
          data: {},
        };
      }

      return {
        status: true,
        message: response.message,
        data: response.data,
      };
    } catch (error: any) {
      console.log('catch', error);
      return {
        status: false,
        message: 'Catch Error',
        data: {},
      };
    }
  }

  @Post('/createUser')
  @HttpCode(200)
  @ApiSecurity('x-api-key')
  @ApiResponse({ status: 200, description: 'OK', type: DtoGlobalResponse })
  async createPrismaUser(
    @Body() request: DtoXXXRequest,
    @Res() res: Response
  ): Promise<void | GlobalResponse> {
    try {
      if (!request.name) {
        return {
          status: false,
          message: 'Name Required',
          data: {},
        };
      }

      const response:any = await this.xxxService.createPrismaUser(request);
      


      // Normal response ise
      if (!response.status) {
        return {
          status: false,
          message: 'Command Send Failed',
          data: {},
        };
      }

      return {
        status: true,
        message: response.message,
        data: response.data,
      };
    } catch (error: any) {
      console.log('catch', error);
      return {
        status: false,
        message: 'Catch Error',
        data: {},
      };
    }
  }

  @Get('/models')
  @HttpCode(200)
  @ApiSecurity('x-api-key')
  @ApiResponse({ status: 200, description: 'OK', type: DtoGlobalResponse })
  async xxxModels(): Promise<GlobalResponse> {
    try {
      const response = await this.xxxService.models();
      if (!response.status) {
        return {
          status: false,
          message: 'Command Send Failed',
          data: {},
        };
      }

      return {
        status: true,
        message: response.message,
        data: response.data,
      };
    } catch (error: any) {
      console.log('catch', error);
      return {
        status: false,
        message: error.message || 'Bilinmeyen bir hata oluştu.',
        data: {},
      };
    }
  }


}
