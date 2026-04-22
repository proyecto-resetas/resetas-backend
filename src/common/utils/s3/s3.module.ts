import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { UploadS3Controller } from './s3.controller';
import { RolesModule } from 'src/module/roles/roles.module';
@Module({
  imports: [RolesModule],
  controllers: [UploadS3Controller],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
