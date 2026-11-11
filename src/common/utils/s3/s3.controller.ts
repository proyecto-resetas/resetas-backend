import {
  BadRequestException,
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
@Secure([UserRole.ADMIN, UserRole.USER], ['s3:upload'])
@Controller('s3')
export class UploadS3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload')
  @ApiResponse({ status: 201, description: 'Created Recipe' })
  @ApiResponse({ status: 400, description: 'Dates invalid.' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        const mime = (file?.mimetype || '').toLowerCase();
        const name = (file?.originalname || '').toLowerCase();
        const isImageMime = mime.startsWith('image/');
        const isImageExt = /\.(jpe?g|png|webp|gif|heic|heif|bmp)$/i.test(name);
        if (!isImageMime && !isImageExt) {
          return callback(
            new BadRequestException(
              'Solo se permiten archivos de imagen válidos (JPG, PNG, WEBP, HEIC).',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo de imagen.');
    }
    const imageUrl = await this.s3Service.uploadFile(file);
    return imageUrl;
  }
}
