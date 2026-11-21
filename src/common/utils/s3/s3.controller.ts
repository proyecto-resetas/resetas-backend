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
      limits: { fileSize: 50 * 1024 * 1024 }, // Hasta 50MB para soportar imágenes y videos
      fileFilter: (_req, file, callback) => {
        const mime = (file?.mimetype || '').toLowerCase();
        const name = (file?.originalname || '').toLowerCase();
        const isImageMime = mime.startsWith('image/');
        const isVideoMime = mime.startsWith('video/');
        const isImageExt = /\.(jpe?g|png|webp|gif|heic|heif|bmp)$/i.test(name);
        const isVideoExt = /\.(mp4|mov|avi|mkv|webm)$/i.test(name);
        if (!isImageMime && !isImageExt && !isVideoMime && !isVideoExt) {
          return callback(
            new BadRequestException(
              'Solo se permiten archivos multimedia válidos (imágenes o videos).',
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
      throw new BadRequestException('No se recibió ningún archivo multimedia.');
    }
    const imageUrl = await this.s3Service.uploadFile(file);
    return imageUrl;
  }
}
