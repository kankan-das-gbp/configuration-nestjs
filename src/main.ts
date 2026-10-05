import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Api version , started with v1
  app.setGlobalPrefix('v1');

  //Build interactive Swagger API UI documentation 
  const config = new DocumentBuilder()
    .setTitle('Magento Configuration Data Service : NestJs')
    .setDescription('Service designed to track and extract structure maps from Magento .xml files.')
    .setVersion('1.0.0')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // 4. Resolve the dynamic execution port from system environment configurations
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
  console.log(`Service on: http://localhost:${port}/v1`);
  console.log(`Swagger documentation available at: http://localhost:${port}/docs`);
}
bootstrap();
