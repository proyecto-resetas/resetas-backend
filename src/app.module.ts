import { Module } from '@nestjs/common';
import { AuthModule } from './module/auth/auth.module';
import { UsersModule } from './module/users/users.module';
import { PersistenceModule } from './module/persistance';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from './common/utils/utils.module';
import dbConfig from './module/persistance/db-config';
import { RecipesModule } from './module/recipes/recipes.module';
import { StepsModule } from './module/steps/steps.module';
import { S3Module } from './common/utils/s3/s3.module';
import { PaymentWompiModule } from './module/payment_wompi/payment_wompi.module';
import { ApiKeyModule } from './common/utils/apikey/apikey.module';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from './common/guard/x-api-key/x-api-key.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [dbConfig],
      isGlobal: true,
    }),
    PersistenceModule,
    UsersModule,
    UtilsModule,
    AuthModule,
    RecipesModule,
    StepsModule,
    S3Module,
    PaymentWompiModule,
    ApiKeyModule,
  ],
  controllers: [],
  // providers: [
  //   {
  //     provide: APP_GUARD,
  //     useClass: ApiKeyGuard,
  //   },
  // ],
  
})

export class AppModule {}
