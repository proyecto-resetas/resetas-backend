import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    // Inicializar el cliente de S3
    this.s3Client = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    this.bucketName = process.env.AWS_S3_BUCKET_NAME;
  }

  async uploadFile(file: Express.Multer.File): Promise<{ imageUrl: string; originalFileName: string }> {
    const fileExtension = file.originalname.split('.').pop();
    const key = `${uuidv4()}.${fileExtension}`; // Generar un nombre o id único para el archivo

    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);

      const imageUrl = `https://${this.bucketName}.s3.amazonaws.com/${key}`;
      return {
        imageUrl: imageUrl,
        originalFileName: file.originalname, 
      };
    } catch (err) {
      console.error('Error uploading file: ', err);
      throw new Error('Failed to upload file');
    }
  }
}
