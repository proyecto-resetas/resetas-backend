import { Module } from '@nestjs/common';
import { AuthModule } from './module/auth/auth.module';
import { UsersModule } from './module/users/users.module';
import { PersistenceModule } from './persistance/persistance';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from './common/utils/utils.module';
import dbConfig from './persistance/persistance/db-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [dbConfig],
      isGlobal: true,
    }),
    PersistenceModule,
    AuthModule,
    UsersModule,
    UtilsModule,
  ],
  controllers: [],
  providers: [],
})

export class AppModule {}
