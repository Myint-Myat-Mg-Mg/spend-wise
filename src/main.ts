import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = new DocumentBuilder()
  .setTitle('Spend-Wise API')
  .setDescription('For Wisely Spend API Documentation')
  .setVersion('1.0')
  .addBearerAuth()
  .addTag('api')
  .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/src/uploads/',
  })

  await app.listen(5000);
}
bootstrap();
 