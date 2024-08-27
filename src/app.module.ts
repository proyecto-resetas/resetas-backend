import { Module } from '@nestjs/common';
import { AuthModule } from './module/auth/auth.module';
import { UsersModule } from './module/users/users.module';
import { PersistenceModule } from './module/persistance';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from './common/utils/utils.module';
import dbConfig from './module/persistance/db-config';

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
  ],
  controllers: [],
  
})

export class AppModule {}
