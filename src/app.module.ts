import { Module } from '@nestjs/common';
import { AuthModule } from './module/auth/auth.module';
import { UsersModule } from './module/users/users.module';
import { PersistenceModule } from './module/persistance';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from './common/utils/utils.module';
import dbConfig from './module/persistance/db-config';
import { RecipesModule } from './module/recetas/recetas.module';
import { StepsModule } from './module/steps/steps.module';
import { S3Module } from './common/utils/s3/s3.module';
import { PaymentWompiModule } from './module/payment_wompi/payment_wompi.module';
import { ApiKeyModule } from './common/utils/apikey/apikey.module';

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
  
})

export class AppModule {}
