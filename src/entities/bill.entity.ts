import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Customer } from './customer.entity';
import { BillItem } from './bill-item.entity';

@Entity('bill')
export class Bill {
  @PrimaryGeneratedColumn({ name: 'bill_id' })
  billId: number;

  @Column({ name: 'bill_pdf', type: 'varchar', length: 500, nullable: true })
  billPdf: string;

  @Column({ name: 'company_id', type: 'int' })
  companyId: number;

  @ManyToOne(() => Company, (company) => company.bills)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'customer_id', type: 'int', nullable: true })
  customerId: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'created_by', type: 'int' })
  createdBy: number;

  @CreateDateColumn({ name: 'created_on', type: 'timestamp' })
  createdOn: Date;

  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy: number;

  @UpdateDateColumn({ name: 'updated_on', type: 'timestamp', nullable: true })
  updatedOn: Date;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @OneToMany(() => BillItem, (billItem) => billItem.bill, { cascade: true })
  items: BillItem[];
}

