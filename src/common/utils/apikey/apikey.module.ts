import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKeyController } from './apikey.controller';
import { ApiKeyService } from './apikey.service';
import { ApiKey, ApiKeySchema } from './entities/apikey.entitie';
import { ApiKeyGuard } from 'src/common/guard/x-api-key/x-api-key.guard';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: ApiKey.name, schema: ApiKeySchema }]),
  ],
  controllers: [ApiKeyController],
  providers: [ApiKeyService, ApiKeyGuard],
  exports: [ApiKeyService],
})
export class ApiKeyModule {}