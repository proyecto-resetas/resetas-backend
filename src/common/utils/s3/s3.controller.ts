import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';
import { Express } from 'express'; // Para definir el tipo de archivo
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('imageS3')
@Controller('s3')
export class UploadS3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload')
  @ApiResponse({ status: 201, description: 'Created Recipe' })
  @ApiResponse({ status: 400, description: 'Dates invalid.' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file) {
    const imageUrl = await this.s3Service.uploadFile(file);
    return  imageUrl ;
  }
}
