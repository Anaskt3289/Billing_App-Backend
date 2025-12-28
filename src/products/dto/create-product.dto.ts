import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { UOM } from '../../entities/product.entity';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  productName: string;

  @IsNotEmpty()
  @IsString()
  productCode: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsNotEmpty()
  @IsNumber()
  basePrice: number;

  @IsNotEmpty()
  @IsEnum(UOM)
  uom: UOM;
}

