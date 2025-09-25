import {
  Controller,
  Get,
  Param,
  Post,
  Response,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  AnyFilesInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FilesLocalService } from './files.service';
import { FileResponseDto } from './dto/file-response.dto';

@ApiTags('Files')
@Controller({
  path: 'files',
  version: '1',
})
export class FilesLocalController {
  constructor(private readonly filesService: FilesLocalService) {}

  @ApiCreatedResponse({
    type: FileResponseDto,
    description:
      'File upload - returns single object for one file, array for multiple files',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(AnyFilesInterceptor()) // Accept files from any field name
  async uploadFile(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<FileResponseDto | FileResponseDto[]> {
    return this.filesService.createFlexible(files);
  }

  @ApiCreatedResponse({
    type: [FileResponseDto],
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('upload-multiple')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<FileResponseDto[]> {
    return this.filesService.createMultiple(files);
  }

  @Get(':path')
  @ApiExcludeEndpoint()
  download(@Param('path') path: string, @Response() response: any) {
    return response.sendFile(path, { root: './files' });
  }
}
