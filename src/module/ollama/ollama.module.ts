import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OllamaService } from './ollama.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      maxRedirects: 0,
    }),
  ],
  providers: [OllamaService],
  exports: [OllamaService],
})
export class OllamaModule {}
