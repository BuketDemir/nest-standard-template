import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class APIConfig {
  constructor(private configService: ConfigService) {}

  get xApiKey(): string {
    return this.configService.get('X_API_KEY') || "4b679ab8-8d82-47be-9145-c45b9105fae9";
  }

  get xxxApiUrl(): string {
    return this.configService.get('XXX_API_URL') || 'http://localhost:11434';
  }

  get zzzApiKey(): string {
    return this.configService.get('ZZZ_API_KEY');
  }

  get zzzApiUrl(): string {
    return this.configService.get('ZZZ_API_URL') || 'https://api.zzz.com/v1/chat/completions';
  }

  get mongoDSN(): string {
    return this.configService.get('MONGO_DSN') || 'https://api.zzz.com/v1/chat/completions';
  }

}