import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, OnModuleInit } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiKeyGuard } from './guards/api-key.guard';
import { FilesModule } from './files/files.module';
import { XxxModule } from './xxx/xxx.module';
import { ZzzModule } from './zzz/zzz.module';
import { APIConfig } from './utils/API';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 120000, // 2 dakika
        maxRedirects: 5,
      }),
    }),
    FilesModule,
    XxxModule,
    ZzzModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
    APIConfig,
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // Environment değişkenlerini kontrol et
    const missingConfigs = [];
    
    // Zzz konfigürasyonu
    if (!this.configService.get('ZZZ_API_KEY')) {
      missingConfigs.push('ZZZ_API_KEY');
    }
    if (!this.configService.get('ZZZ_API_URL')) {
      missingConfigs.push('ZZZ_API_URL');
    }

    // Xxx konfigürasyonu
    if (!this.configService.get('XXX_API_URL')) {
      missingConfigs.push('XXX_API_URL');
    }

    // X-API-KEY konfigürasyonu
    if (!this.configService.get('X_API_KEY')) {
      missingConfigs.push('X_API_KEY');
    }

    // Eksik konfigürasyonlar varsa uyarı ver
    if (missingConfigs.length > 0) {
      console.warn('\x1b[33m%s\x1b[0m', '⚠️  Missing Environment Variables:');
      missingConfigs.forEach(config => {
        console.warn('\x1b[33m%s\x1b[0m', `   - ${config}`);
      });
      console.warn('\x1b[33m%s\x1b[0m', '   Some features may not work properly!\n');
    } else {
      console.log('\x1b[32m%s\x1b[0m', '✅ All environment variables are configured correctly!\n');
    }
  }
}
