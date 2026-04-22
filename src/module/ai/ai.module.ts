import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIService } from './ai.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      maxRedirects: 0,
    }),
  ],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}
