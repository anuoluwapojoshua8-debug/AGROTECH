import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME', '');
    this.apiKey = this.configService.get<string>('CLOUDINARY_API_KEY', '');
    this.apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET', '');
  }

  private get isCloudinaryConfigured(): boolean {
    return !!(
      this.cloudName &&
      this.cloudName !== 'your-cloud-name' &&
      this.apiKey &&
      this.apiKey !== 'your-api-key' &&
      this.apiSecret &&
      this.apiSecret !== 'your-api-secret'
    );
  }

  async uploadImage(
    file: Express.Multer.File,
    folder = 'agrotech',
  ): Promise<CloudinaryUploadResult> {
    if (!file) throw new BadRequestException('No file provided');

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed: JPEG, PNG, WebP, AVIF, PDF');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File too large. Maximum size: 5MB');
    }

    if (!this.isCloudinaryConfigured) {
      return this.saveLocally(file, folder);
    }

    try {
      const base64Data = file.buffer.toString('base64');
      const dataUri = `data:${file.mimetype};base64,${base64Data}`;

      const result = await this.uploadToCloudinary(dataUri, folder);
      return result;
    } catch (error: any) {
      this.logger.error(`Upload error: ${error.message}`);
      throw new BadRequestException('File upload failed');
    }
  }

  private saveLocally(file: Express.Multer.File, folder: string): CloudinaryUploadResult {
    const safeFolder = folder.replace(/[^a-z0-9-_]/gi, '_');
    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const relDir = path.posix.join('uploads', safeFolder);
    const absDir = path.resolve(process.cwd(), relDir);

    fs.mkdirSync(absDir, { recursive: true });
    fs.writeFileSync(path.join(absDir, name), file.buffer);

    const publicPath = `/${relDir}/${name}`;
    this.logger.log(`Saved upload locally: ${publicPath}`);
    return {
      secure_url: publicPath,
      public_id: name,
      format: ext.replace('.', ''),
      width: 0,
      height: 0,
    };
  }

  async uploadImages(files: Express.Multer.File[], folder = 'agrotech'): Promise<CloudinaryUploadResult[]> {
    if (!files || files.length === 0) throw new BadRequestException('No files provided');

    const results = await Promise.all(
      files.map((file) => this.uploadImage(file, folder)),
    );

    return results;
  }

  async deleteImage(publicId: string): Promise<void> {
    if (!this.isCloudinaryConfigured) {
      this.logger.warn(`Skipping delete for local file: ${publicId}`);
      return;
    }

    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signature = await this.generateSignature(`public_id=${publicId}&timestamp=${timestamp}`);

      const formData = new URLSearchParams();
      formData.append('public_id', publicId);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', this.apiKey);
      formData.append('signature', signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
        {
          method: 'POST',
          body: formData,
        },
      );

      const data = await response.json();
      if (data.result !== 'ok') {
        this.logger.warn(`Failed to delete image: ${publicId}`);
      }
    } catch (error: any) {
      this.logger.error(`Delete error: ${error.message}`);
    }
  }

  private async uploadToCloudinary(dataUri: string, folder: string): Promise<CloudinaryUploadResult> {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = `folder=${folder}&timestamp=${timestamp}`;
    const signature = await this.generateSignature(params);

    const formData = new URLSearchParams();
    formData.append('file', dataUri);
    formData.append('folder', folder);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', this.apiKey);
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return {
      secure_url: data.secure_url,
      public_id: data.public_id,
      format: data.format,
      width: data.width,
      height: data.height,
    };
  }

  private async generateSignature(params: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(params + this.apiSecret);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
}
