import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { APIConfig } from '../utils/API';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private apiConfig: APIConfig) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // Public decorator'ü varsa API key kontrolü yapma
    const isPublic = Reflect.getMetadata('isPublic', context.getHandler());
    if (isPublic) return true;

    const apiKey = request.headers['x-api-key'];
    if (!apiKey || apiKey !== this.apiConfig.xApiKey) {
      return false;
    }
    return true;
  }
} 