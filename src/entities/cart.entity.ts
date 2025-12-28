import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { User } from './user.entity';
import { CartItem } from './cart-item.entity';

@Entity('cart')
export class Cart {
  @PrimaryGeneratedColumn({ name: 'cart_id' })
  cartId: number;

  @Column({ name: 'company_id', type: 'int' })
  companyId: number;

  @ManyToOne(() => Company, (company) => company.carts)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'created_by', type: 'int' })
  createdBy: number;

  @Column({ name: 'is_draft', type: 'boolean', default: true })
  isDraft: boolean;

  @Column({ name: 'is_draft', type: 'boolean', default: true })
  isBillGenerated: boolean;

  @CreateDateColumn({ name: 'created_on', type: 'timestamp' })
  createdOn: Date;

  @UpdateDateColumn({ name: 'updated_on', type: 'timestamp', nullable: true })
  updatedOn: Date;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, { cascade: true })
  items: CartItem[];
}

