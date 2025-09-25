// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class UpdateOfficeRateDto {
  @IsNumber()
  @IsOptional()
  buyRate?: number;
  @IsNumber()
  @IsOptional()
  sellRate?: number;
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
