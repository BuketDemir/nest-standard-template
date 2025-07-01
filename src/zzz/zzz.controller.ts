import { Body, Controller, HttpCode, Post, Res, HttpException } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { GlobalResponse } from '../types/GlobalResponse';
import { DtoGlobalResponse } from '../dto/dtoGlobalResponse';
import { DtoZZZRequest } from '../dto/zzz/dtoRequest';
import { ZzzService } from './zzz.service';

@ApiTags('zzz')
@Controller('zzz')
export class ZzzController {
  constructor(private readonly zzzService: ZzzService) {}

  @Post('/chat')
  @HttpCode(200)
  @ApiSecurity('x-api-key')
  @ApiResponse({ status: 200, description: 'Zzz Chat request successful', type: DtoGlobalResponse })
  async zzzChat(
    @Body() request: DtoZZZRequest,
    @Res() res: Response
  ): Promise<void> {
    try {
      if (!request.model) {
        res.status(400).json({
          status: false,
          message: 'Model Required',
          data: null
        });
        return;
      }

      if (!request.messages || request.messages.length === 0) {
        res.status(400).json({
          status: false,
          message: 'Messages Required',
          data: null
        });
        return;
      }

      const response = await this.zzzService.chat(request);
      
      // Stream response için header'ları ayarla
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Transfer-Encoding', 'chunked');
      
      (response as Observable<any>).subscribe({
        next: (chunk) => {
          res.write(JSON.stringify(chunk) + '\n');
        },
        error: (error) => {
          // Eğer response header'ları zaten gönderilmişse
          if (res.headersSent) {
            res.end(JSON.stringify({
              status: false,
              message: error.message || 'Stream error occurred',
              data: null
            }));
          } else {
            // Header'lar henüz gönderilmemişse
            if (error instanceof HttpException) {
              const response = error.getResponse() as any;
              res.status(error.getStatus()).json(response);
            } else {
              res.status(500).json({
                status: false,
                message: error.message || 'An unexpected error occurred',
                data: null
              });
            }
          }
        },
        complete: () => {
          res.end();
        }
      });
    } catch (error) {
      // Eğer response header'ları zaten gönderilmişse
      if (res.headersSent) {
        res.end(JSON.stringify({
          status: false,
          message: error.message || 'An error occurred',
          data: null
        }));
      } else {
        // Header'lar henüz gönderilmemişse
        if (error instanceof HttpException) {
          const response = error.getResponse() as any;
          res.status(error.getStatus()).json(response);
        } else {
          res.status(500).json({
            status: false,
            message: error.message || 'An unexpected error occurred',
            data: null
          });
        }
      }
    }
  }
} 