import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import { Readable } from 'stream';
import config from '../config/index.js';
import { v4 as uuidv4 } from 'uuid';

class S3Service {
  private s3Client: S3Client;
  
  constructor() {
    // Config for S3 client
    const clientConfig: any = {
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId!,
        secretAccessKey: config.aws.secretAccessKey!,
      },
    };
    
    // Add endpoint when using LocalStack
    if (process.env.AWS_ENDPOINT) {
      clientConfig.endpoint = process.env.AWS_ENDPOINT;
      clientConfig.forcePathStyle = true; // Required for LocalStack
    }
    
    this.s3Client = new S3Client(clientConfig);
  }
  
  /**
   * Upload a file to S3 from a local file path
   */
  async uploadFile(filePath: string, contentType: string): Promise<string> {
    const fileContent = fs.readFileSync(filePath);
    const fileName = `${uuidv4()}-${path.basename(filePath)}`;
    
    const uploadParams = {
      Bucket: config.aws.bucketName,
      Key: fileName,
      Body: fileContent,
      ContentType: contentType,
    };
    
    const command = new PutObjectCommand(uploadParams);
    await this.s3Client.send(command);
    
    return fileName;
  }
  
  /**
   * Get a presigned URL for downloading the file
   */
  async getPresignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: config.aws.bucketName,
      Key: key,
    });
    
    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
  
  /**
   * Get file content from S3
   */
  async getFileContent(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: config.aws.bucketName,
      Key: key,
    });
    
    const response = await this.s3Client.send(command);
    
    if (!response.Body) {
      throw new Error('Empty file content');
    }
    
    // Convert the response body to a string
    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];
    
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
  }
}

import path from 'path';
export default new S3Service();