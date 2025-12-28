import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { UOM } from '../../entities/product.entity';

export class UpdateProductDto {
  @IsOptional()
  productName?: string;

  @IsOptional()
  @IsString()
  productCode?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @IsOptional()
  @IsEnum(UOM)
  uom?: UOM;
}