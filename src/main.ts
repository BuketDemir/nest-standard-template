import { NestFactory } from '@nestjs/core';
//import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS ayarları
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  });

  const config = new DocumentBuilder()
    .setTitle('StandardTemplate Api Service')
    .setDescription('StandardTemplate Api Service')
    .setVersion('1.0')
    .addServer('/standardtemplate-api/v1')
    .addApiKey({
      type: 'apiKey',
      name: 'x-api-key',
      in: 'header',
    }, 'x-api-key')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('standardtemplate-api/v1/api', app, document);
  app.setGlobalPrefix('standardtemplate-api/v1');
  
  await app.listen(3000);

}

bootstrap();
