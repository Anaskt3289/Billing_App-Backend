import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from './company.entity';

export enum UOM {
  PER_PIECE = 'PER_PIECE',
  KG = 'KG',
  GRAM = 'GRAM',
  LITER = 'LITER',
  METER = 'METER',
}

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn({ name: 'product_id' })
  productId: number;

  @Column({ name: 'product_name', type: 'varchar', length: 255 })
  productName: string;

  @Column({ name: 'product_code', type: 'varchar', length: 100 })
  productCode: string;

  @Column({ name: 'quantity', type: 'decimal', precision: 10, scale: 2, default: 0 })
  quantity: number;

  @Column({ name: 'base_price', type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({
    name: 'uom',
    type: 'enum',
    enum: UOM,
    default: UOM.PER_PIECE,
  })
  uom: UOM;

  @Column({ name: 'company_id', type: 'int' })
  companyId: number;

  @ManyToOne(() => Company, (company) => company.products)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'created_by', type: 'int' })
  createdBy: number;

  @CreateDateColumn({ name: 'created_on', type: 'timestamp' })
  createdOn: Date;

  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy: number;

  @UpdateDateColumn({ name: 'updated_on', type: 'timestamp', nullable: true })
  updatedOn: Date;
}

