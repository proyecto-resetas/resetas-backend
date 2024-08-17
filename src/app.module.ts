import { Module } from '@nestjs/common';
import { UsersModule } from './module/users/users.module';
import { PersistenceModule } from './persistance/persistance';
import { ConfigModule } from '@nestjs/config';
import dbConfig from './persistance/persistance/db-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [dbConfig],
      isGlobal: true,
    }),
    PersistenceModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})

export class AppModule {}
