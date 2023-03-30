import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // adjust exception factory so that not only error messages but also field keys are returned
      exceptionFactory: (errors: ValidationError[]) => {
        let newErrors = {};
        errors.forEach((error) => {
          // object key: name of frontend field, object value: array of the error messages belonging to this field
          newErrors[error.property] = Object.values(error.constraints);
        });
        return new BadRequestException(newErrors);
      },
    }),
  );
  app.enableCors();
  app.setGlobalPrefix('api');
  await app.listen(3001);
}
bootstrap();
