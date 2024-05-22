import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class FileUploadAwsService {
  private readonly s3: AWS.S3;

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get<string>('aws.S3_ACCESS_KEY'),
      secretAccessKey: this.configService.get<string>('aws.S3_SECRET_KEY'),
      region: this.configService.get<string>('aws.S3_REGION'),
    });
  }

  async uploadFile(buffer: Buffer, fileName: string): Promise<string> {
    const params = {
      Bucket: this.configService.get<string>('aws.S3_NAME'),
      Key: fileName,
      Body: buffer,
    };

    const uploadResult = await this.s3.upload(params).promise();

    if (!uploadResult.Location) {
      throw new Error('File upload failed');
    }

    return uploadResult.Location;
  }
}
