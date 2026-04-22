import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Secure } from 'src/common/decorators/secure.decorator';
import { UserRole } from 'src/common/guard/roles.enum';

@ApiTags('imageS3')
@Secure([UserRole.ADMIN, UserRole.USER] , ['s3:upload'])
@Controller('s3')
export class UploadS3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload')
  @ApiResponse({ status: 201, description: 'Created Recipe' })
  @ApiResponse({ status: 400, description: 'Dates invalid.' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file) {
    const imageUrl = await this.s3Service.uploadFile(file);
    return imageUrl;
  }
}
