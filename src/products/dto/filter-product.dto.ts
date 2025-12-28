import { IsOptional, IsNumber, IsString } from 'class-validator';

export class FilterProductDto {
  @IsOptional()
  @IsNumber()
  companyId?: number;

  @IsOptional()
  @IsString()
  searchTerm?: string;
}

