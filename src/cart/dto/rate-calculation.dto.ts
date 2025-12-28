import { IsNotEmpty, IsNumber, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UOM } from '../../entities/product.entity';

export class RateItemDto {
  @IsNotEmpty()
  @IsNumber()
  basePrice: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsEnum(UOM)
  uom: UOM;
}

export class RateCalculationDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RateItemDto)
  items: RateItemDto[];
}

