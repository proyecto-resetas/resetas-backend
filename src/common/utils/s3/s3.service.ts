import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly provider: 'aws' | 'cloudflare';
  private readonly publicBaseUrl?: string;

  constructor(private configService: ConfigService) {
    // Leer el proveedor deseado: 'aws' o 'cloudflare' (por defecto 'aws')
    const configuredProvider = (
      this.configService.get<string>('STORAGE_PROVIDER') ||
      process.env.STORAGE_PROVIDER ||
      'aws'
    )
      .trim()
      .toLowerCase();

    this.provider =
      configuredProvider === 'cloudflare' || configuredProvider === 'r2'
        ? 'cloudflare'
        : 'aws';

    if (this.provider === 'cloudflare') {
      const accountId =
        this.configService.get<string>('CLOUDFLARE_R2_ACCOUNT_ID') ||
        process.env.CLOUDFLARE_R2_ACCOUNT_ID;
      const accessKeyId =
        this.configService.get<string>('CLOUDFLARE_R2_ACCESS_KEY_ID') ||
        process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
      const secretAccessKey =
        this.configService.get<string>('CLOUDFLARE_R2_SECRET_ACCESS_KEY') ||
        process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

      this.bucketName =
        this.configService.get<string>('CLOUDFLARE_R2_BUCKET_NAME') ||
        process.env.CLOUDFLARE_R2_BUCKET_NAME ||
        '';

      this.publicBaseUrl =
        this.configService.get<string>('CLOUDFLARE_R2_PUBLIC_URL') ||
        process.env.CLOUDFLARE_R2_PUBLIC_URL;

      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: accessKeyId || '',
          secretAccessKey: secretAccessKey || '',
        },
      });

      this.logger.log(
        `[Storage] Proveedor activo: Cloudflare R2 | Bucket: ${this.bucketName} | URL pública: ${this.publicBaseUrl || 'default'}`,
      );
    } else {
      const region =
        this.configService.get<string>('AWS_REGION') ||
        this.configService.get<string>('S3_REGION') ||
        process.env.AWS_REGION ||
        process.env.S3_REGION ||
        'us-west-2';

      const accessKeyId =
        this.configService.get<string>('AWS_ACCESS_KEY_ID') ||
        process.env.AWS_ACCESS_KEY_ID;

      const secretAccessKey =
        this.configService.get<string>('AWS_SECRET_ACCESS_KEY') ||
        process.env.AWS_SECRET_ACCESS_KEY;

      this.bucketName =
        this.configService.get<string>('AWS_S3_BUCKET_NAME') ||
        process.env.AWS_S3_BUCKET_NAME ||
        '';

      this.s3Client = new S3Client({
        region,
        credentials: {
          accessKeyId: accessKeyId || '',
          secretAccessKey: secretAccessKey || '',
        },
      });

      this.logger.log(
        `[Storage] Proveedor activo: AWS S3 | Bucket: ${this.bucketName} | Región: ${region}`,
      );
    }
  }

  async uploadFile(
    file,
  ): Promise<{ imageUrl: string; originalFileName: string }> {
    const fileExtension = file.originalname.split('.').pop();
    const key = `${uuidv4()}.${fileExtension}`;

    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);

      let fileUrl: string;
      if (this.provider === 'cloudflare' && this.publicBaseUrl) {
        const cleanBase = this.publicBaseUrl.replace(/\/+$/, '');
        fileUrl = `${cleanBase}/${key}`;
      } else if (this.provider === 'cloudflare') {
        fileUrl = `https://${this.bucketName}.r2.dev/${key}`;
      } else {
        fileUrl = `https://${this.bucketName}.s3.amazonaws.com/${key}`;
      }

      return {
        imageUrl: fileUrl,
        originalFileName: file.originalname,
      };
    } catch (err) {
      this.logger.error('Error subiendo archivo al storage: ', err);
      throw new Error('Failed to upload file');
    }
  }
}
