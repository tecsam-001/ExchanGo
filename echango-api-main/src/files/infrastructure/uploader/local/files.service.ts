import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { FileRepository } from '../../persistence/file.repository';
import { AllConfigType } from '../../../../config/config.type';
import { FileType } from '../../../domain/file';

@Injectable()
export class FilesLocalService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly fileRepository: FileRepository,
  ) {}

  async create(file: Express.Multer.File): Promise<{ file: FileType }> {
    if (!file) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          file: 'selectFile',
        },
      });
    }

    return {
      file: await this.fileRepository.create({
        path: `/${this.configService.get('app.apiPrefix', {
          infer: true,
        })}/v1/${file.path}`,
      }),
    };
  }

  async createMultiple(
    files: Express.Multer.File[],
  ): Promise<{ file: FileType }[]> {
    if (!files || files.length === 0) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          files: 'selectFiles',
        },
      });
    }

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        return {
          file: await this.fileRepository.create({
            path: `/${this.configService.get('app.apiPrefix', {
              infer: true,
            })}/v1/${file.path}`,
          }),
        };
      }),
    );

    return uploadedFiles;
  }

  async createFlexible(
    files: Express.Multer.File[],
  ): Promise<{ file: FileType } | { file: FileType }[]> {
    if (!files || files.length === 0) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          files: 'selectFiles',
        },
      });
    }

    // If only one file, return single object (same structure as before)
    if (files.length === 1) {
      return {
        file: await this.fileRepository.create({
          path: `/${this.configService.get('app.apiPrefix', {
            infer: true,
          })}/v1/${files[0].path}`,
        }),
      };
    }

    // If multiple files, return array
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        return {
          file: await this.fileRepository.create({
            path: `/${this.configService.get('app.apiPrefix', {
              infer: true,
            })}/v1/${file.path}`,
          }),
        };
      }),
    );

    return uploadedFiles;
  }
}
