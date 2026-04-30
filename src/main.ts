import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiKeyGuard } from './common/guard/x-api-key/x-api-key.guard';
import { ApiKeyService } from './common/utils/apikey/apikey.service';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //const apiKeyService = app.get(ApiKeyService); // Obtén el servicio desde el contenedor
  //app.useGlobalGuards(new ApiKeyGuard(apiKeyService)); // Pasa la instancia al guard
  //app.setGlobalPrefix('api/v1', { exclude: ['/api-doc'] });

  const port = process.env.PORT || 3001; // Cambiado a 3001 para evitar conflictos comunes
  app.setGlobalPrefix('', { exclude: ['/', 'api', '/api-doc'] });
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true, // Elimina propiedades no definidas en el DTO
      // // forbidNonWhitelisted: false evita 400 en objetos anidados (bug conocido con class-validator + nested)
      // forbidNonWhitelisted: false,
      // transform: true,
      // transformOptions: {
      //   enableImplicitConversion: true,
      // },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API RESETAS')
    .setDescription('API for get recipes unique')
    .setVersion('1.0')
    .addTag('team resetas')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
      },
      'x-api-key',
    )
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
