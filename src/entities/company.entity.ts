import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';
import { Cart } from './cart.entity';
import { Bill } from './bill.entity';
import { Customer } from './customer.entity';

@Entity('company')
export class Company {
  @PrimaryGeneratedColumn({ name: 'company_id' })
  companyId: number;

  @Column({ name: 'company_name', type: 'varchar', length: 255 })
  companyName: string;

  @Column({ name: 'logo_key', type: 'varchar', length: 500, nullable: true })
  logoKey: string;

  @CreateDateColumn({ name: 'created_on', type: 'timestamp' })
  createdOn: Date;

  @Column({ name: 'is_blocked', type: 'boolean', default: false })
  isBlocked: boolean;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @OneToMany(() => Product, (product) => product.company)
  products: Product[];

  @OneToMany(() => Cart, (cart) => cart.company)
  carts: Cart[];

  @OneToMany(() => Bill, (bill) => bill.company)
  bills: Bill[];

  @OneToMany(() => Customer, (customer) => customer.company)
  customers: Customer[];
}

