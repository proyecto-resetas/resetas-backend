import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiKeyGuard } from './common/guard/x-api-key/x-api-key.guard';
import { ApiKeyService } from './common/utils/apikey/apikey.service';
import { ApiKeyInterceptor } from './common/interceptors/apikey/apikey.interceptor';

async function bootstrap() {
 const app = await NestFactory.create(AppModule);
 const apiKeyService = app.get(ApiKeyService); // Obtén el servicio desde el contenedor
 app.useGlobalGuards(new ApiKeyGuard(apiKeyService)); // Pasa la instancia al guard
 //app.setGlobalPrefix('api/v1', { exclude: ['/api-doc'] }); 
 //app.useGlobalInterceptors(new ApiKeyInterceptor());


  const port = process.env.PORT || 3000;
  app.setGlobalPrefix('api/v1', { exclude: ['/'] });
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

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
      'x-api-key'
    )
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document);

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api/v1`);
}
bootstrap();
