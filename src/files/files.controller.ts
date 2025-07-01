import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { FilesService, PdfFile } from './files.service';
import { GlobalResponse } from '../types/GlobalResponse';
import { memoryStorage } from 'multer';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @HttpCode(200)
  @ApiSecurity('x-api-key')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'PDF uploaded successfully' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 128 * 1024 * 1024, // 128MB
      },
      fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          return callback(
            new BadRequestException('Only PDF files are allowed'),
            false,
          );
        }
        callback(null, true);
      },
      preservePath: false,
      dest: undefined,
    }),
  )
  async uploadPdf(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<GlobalResponse> {
    try {
      if (!file) {
        return {
          status: false,
          message: 'No file provided',
          data: {},
        };
      }

      const uploadedFile = await this.filesService.uploadPdf(file);

      return {
        status: true,
        message: 'PDF uploaded successfully',
        data: uploadedFile,
      };
    } catch (error: any) {
      console.error('Upload error:', error);
      return {
        status: false,
        message: error.message || 'Upload failed',
        data: {},
      };
    }
  }

  @Get()
  @HttpCode(200)
  @ApiSecurity('x-api-key')
  @ApiResponse({ status: 200, description: 'PDF files retrieved successfully' })
  async getAllData(): Promise<GlobalResponse> {
    try {
      const data = await this.filesService.getAllData();

      return {
        status: true,
        message: 'PDF files retrieved successfully',
        data: { data },
      };
    } catch (error: any) {
      console.error('Get files error:', error);
      return {
        status: false,
        message: error.message || 'Failed to retrieve files',
        data: {},
      };
    }
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiSecurity('x-api-key')
  @ApiResponse({ status: 200, description: 'PDF deleted successfully' })
  async deletePdf(@Param('id') id: string): Promise<GlobalResponse> {
    try {
      if (!id) {
        return {
          status: false,
          message: 'File ID is required',
          data: {},
        };
      }

      const deleted = await this.filesService.deletePdf(id);

      if (!deleted) {
        return {
          status: false,
          message: 'File not found',
          data: {},
        };
      }

      return {
        status: true,
        message: 'PDF deleted successfully',
        data: { id },
      };
    } catch (error: any) {
      console.error('Delete error:', error);
      return {
        status: false,
        message: error.message || 'Delete failed',
        data: {},
      };
    }
  }
} 