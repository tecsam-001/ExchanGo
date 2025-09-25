import { FileDto } from 'src/files/dto/file.dto';
import { IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// DTO for the file upload response format
export class FileUploadResponseDto {
  @ApiProperty({ type: FileDto })
  @ValidateNested()
  @Type(() => FileDto)
  file: FileDto;
}

export class AttachImagesDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileUploadResponseDto)
  @ApiProperty({
    type: FileUploadResponseDto,
    isArray: true,
    description: 'Array of file upload responses from the upload endpoint',
    example: [
      {
        file: {
          path: '/api/v1/files/393939152967bd44f6e63.png',
          id: '087a9c1b-7bc7-4f4c-bbdb-8883f41b7c17',
        },
      },
    ],
  })
  images: FileUploadResponseDto[];
}
