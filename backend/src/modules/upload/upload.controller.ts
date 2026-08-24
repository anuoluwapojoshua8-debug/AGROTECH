import { Controller, Post, UseInterceptors, UploadedFile, UploadedFiles, UseGuards } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a single image' })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadImage(file);
  }

  @Post('images')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload multiple images (max 10)' })
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadService.uploadImages(files);
  }

  @Post('product')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload product images' })
  async uploadProductImages(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadService.uploadImages(files, 'agrotech/products');
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload profile avatar' })
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadImage(file, 'agrotech/avatars');
  }

  @Post('kyc')
  @UseInterceptors(FilesInterceptor('files', 5))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload KYC documents' })
  async uploadKycDocs(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadService.uploadImages(files, 'agrotech/kyc');
  }
}
