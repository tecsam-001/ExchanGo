import 'dotenv/config';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import validationOptions from './utils/validation-options';
import { AllConfigType } from './config/config.type';
import { ResolvePromisesInterceptor } from './utils/serializer.interceptor';
import fs from 'fs';
import yaml from 'js-yaml';
import helmet from 'helmet';
import { LoggerService } from './infrastructure/logger/logger.service';
import { HttpLoggerInterceptor } from './infrastructure/logger/http-logger.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService<AllConfigType>);

  // Replace app.get() with app.resolve()
  const logger = await app.resolve(LoggerService);
  logger.setContext('Application');

  // Use the logger for application
  app.useLogger(logger);

  app.enableShutdownHooks();
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalInterceptors(
    // ResolvePromisesInterceptor is used to resolve promises in responses because class-transformer can't do it
    // https://github.com/typestack/class-transformer/issues/549
    new ResolvePromisesInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
    new HttpLoggerInterceptor(app.get(LoggerService)),
  );

  app.use(helmet());

  const options = new DocumentBuilder()
    .setTitle('ExchangGo24 API')
    .setDescription(' API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .addGlobalParameters({
      in: 'header',
      required: false,
      name: process.env.APP_HEADER_LANGUAGE || 'x-custom-lang',
      schema: {
        example: 'en',
      },
    })
    .build();

  const document = SwaggerModule.createDocument(app, options);
  // Export Swagger documentation as JSON
  fs.writeFileSync('./swagger-spec.json', JSON.stringify(document, null, 2));
  console.log('Swagger JSON file created at ./swagger-spec.json');

  // Export Swagger documentation as YAML
  try {
    fs.writeFileSync('./swagger-spec.yaml', yaml.dump(document));
    console.log('Swagger YAML file created at ./swagger-spec.yaml');
  } catch (error) {
    console.error('Error creating YAML file:', error);
  }

  SwaggerModule.setup('docs', app, document);

  await app.listen(configService.getOrThrow('app.port', { infer: true }));
}
void bootstrap();
