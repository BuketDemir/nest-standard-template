import { HttpService } from '@nestjs/axios';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { GlobalResponse } from '../types/GlobalResponse';
import { APIConfig } from '../utils/API';
import { IZzzRequest } from '../types/zzz/request';

@Injectable()
export class ZzzService {
  constructor(
    private httpService: HttpService,
    private apiConfig: APIConfig
  ) {}

  /**
   * Zzz Chat endpoint
   */
  async chat(request: IZzzRequest): Promise<GlobalResponse | Observable<any>> {
    try {
      const apiKey = this.apiConfig.zzzApiKey;
      const apiUrl = this.apiConfig.zzzApiUrl;

      // API key kontrolü
      if (!apiKey) {
        throw new HttpException({
          status: false,
          message: 'Zzz API key not configured',
          data: null
        }, HttpStatus.BAD_REQUEST);
      }

      // Hardcoded değerlerle request oluştur
      const zzzRequest = {
        model: request.model,
        messages: request.messages,
        stream: true,        // Hardcoded
        temperature: 1,      // Hardcoded
        max_tokens: 1000     // Hardcoded
      };

      // Her zaman stream response dön (stream: true hardcoded)
      return this.makeStreamRequest(zzzRequest, apiKey, apiUrl);
    } catch (error) {
      // Eğer zaten bir HttpException ise, onu olduğu gibi fırlat
      if (error instanceof HttpException) {
        throw error;
      }

      // Diğer hatalar için genel bir hata mesajı
      throw new HttpException({
        status: false,
        message: error.message || 'Zzz request failed',
        data: null
      }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Stream response için özel request helper
   */
  private makeStreamRequest(data: IZzzRequest, apiKey: string, apiUrl: string): Observable<any> {
    return new Observable(subscriber => {
      this.httpService.post(apiUrl, data, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        responseType: 'stream',
      }).subscribe({
        next: (response) => {
          response.data.on('data', (chunk: Buffer) => {
            const lines = chunk.toString().split('\n');
            for (const line of lines) {
              if (line.trim() && line.startsWith('data: ')) {
                const jsonStr = line.replace('data: ', '');
                if (jsonStr.trim() === '[DONE]') {
                  subscriber.complete();
                  return;
                }
                try {
                  const jsonData = JSON.parse(jsonStr);
                  subscriber.next({
                    status: true,
                    message: 'Success',
                    data: jsonData
                  });
                } catch (e) {
                  subscriber.error(new HttpException({
                    status: false,
                    message: 'Failed to parse Zzz response',
                    data: null
                  }, HttpStatus.INTERNAL_SERVER_ERROR));
                }
              }
            }
          });

          response.data.on('end', () => {
            subscriber.complete();
          });

          response.data.on('error', (err: Error) => {
            subscriber.error(new HttpException({
              status: false,
              message: err.message || 'Stream error from Zzz',
              data: null
            }, HttpStatus.INTERNAL_SERVER_ERROR));
          });
        },
        error: (error) => {
          subscriber.error(new HttpException({
            status: false,
            message: error.response?.data?.error?.message || error.message || 'Zzz request failed',
            data: null
          }, error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR));
        }
      });
    });
  }
} 