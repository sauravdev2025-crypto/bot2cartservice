import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UploadService, PropertyService, OperationException, PlatformUtility } from '@servicelabsco/nestjs-utility-services';
import axios from 'axios';

@Injectable()
export class FileUploadService {
  constructor(
    private readonly uploadService: UploadService,
    private readonly propertyService: PropertyService
  ) {}

  public async uploadFile(file: any): Promise<string> {
    const fileTypes = await this.propertyService.get('allowed.upload.file.types', '');
    const allowedTypes = fileTypes.split(',');

    if (!allowedTypes.includes(file.mimetype)) throw new OperationException(`This file of type ${file.mimetype} is not allowed`);

    const params = await this.getParam(file);

    return this.uploadService.uploadFile(params);
  }

  public async uploadToS3(params: any): Promise<string> {
    return this.uploadService.uploadFile(params);
  }

  async getParam(file: any): Promise<any> {
    const name = file.originalname.replace(/[^a-zA-Z0-9. ]/g, '');
    const fileName = `${PlatformUtility.generateRandomAlpha(6).toLowerCase()}_${name.replaceAll(' ', '_')}`;
    const bucket = await this.propertyService.get('aws.config.bucket');

    const urlkey = `expense-other/${fileName}`;
    return {
      Body: file.buffer,
      Key: urlkey,
      Bucket: bucket,
      ACL: 'public-read',
      ContentType: file.mimetype,
    };
  }

  async getFileDetailFromUrl(fileUrl: string) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'video/mp4'];

    let fileBuffer: Buffer;
    let fileType: string;
    let fileName: string;
    let fileLength: number;

    try {
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      fileBuffer = Buffer.from(response.data);
      fileType = response.headers['content-type'] || 'application/octet-stream';
      fileLength = fileBuffer.length;

      // Try to extract filename from URL or fallback
      const urlParts = fileUrl.split('/');
      fileName = urlParts[urlParts.length - 1] || `upload.${this.getFileExtension(fileType)}`;

      // Validate file type
      if (!allowedTypes.includes(fileType)) {
        throw new Error(`File type ${fileType} is not allowed`);
      }

      return {
        file_name: fileName,
        file_length: fileLength,
        file_type: fileType,
      };
    } catch (error) {
      console.error('Error getting file details from URL:', error?.response?.data || error.message);
      throw new InternalServerErrorException('Could not get file details from URL');
    }
  }
  public getFileExtension(contentType: string): string {
    switch (contentType) {
      case 'image/jpeg':
        return 'jpg';
      case 'image/png':
        return 'png';
      case 'application/pdf':
        return 'pdf';
      default:
        return 'bin';
    }
  }

  /**
   * Upload a file from a URL to S3 and return the uploaded URL.
   */
  public async uploadFromUrl(fileUrl: string, file_name?: string): Promise<any> {
    const key = `uploaded.document.via.url.${fileUrl}`;

    const { buffer, mime_type, originalname } = await this.prepareParamsFromUrl(fileUrl);

    const url = await this.uploadService.upload(
      { buffer, originalname: file_name || originalname },
      { mime_type, acl: 'public-read', folder: 'public/bulk' }
    );

    return url;
  }

  /**
   * Prepare S3 upload params from a remote file URL.
   */
  async prepareParamsFromUrl(fileUrl: string) {
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const originalName = this.pickFileName(fileUrl);
    const contentType = response.headers['content-type'];

    const buffer = Buffer.from(response.data);
    return {
      buffer,
      originalname: originalName,
      mime_type: contentType,
    };
  }

  /**
   * Best-effort filename from URL.
   */
  private pickFileName(fileUrl: string): string {
    const raw = fileUrl.split('/').pop() || 'downloaded_file';
    return raw.split('?')[0] || raw;
  }
}
