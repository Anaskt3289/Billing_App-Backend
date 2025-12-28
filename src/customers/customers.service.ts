import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private logger: LoggerService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, userId: number, companyId: number) {
    try {
      const customer = this.customerRepository.create({
        ...createCustomerDto,
        companyId,
        createdBy: userId,
      });

      const savedCustomer = await this.customerRepository.save(customer);
      this.logger.log(`Customer created: ${savedCustomer.customerId}`, 'CustomersService');

      return savedCustomer;
    } catch (error) {
      this.logger.error(`Create customer error: ${error.message}`, error.stack, 'CustomersService');
      throw error;
    }
  }

  async findAll(companyId: number) {
    try {
      return await this.customerRepository.find({
        where: {
          companyId,
          isDeleted: false,
        },
        order: {
          createdOn: 'DESC',
        },
      });
    } catch (error) {
      this.logger.error(`Find all customers error: ${error.message}`, error.stack, 'CustomersService');
      throw error;
    }
  }

  async findOne(id: number, companyId: number) {
    try {
      const customer = await this.customerRepository.findOne({
        where: {
          customerId: id,
          companyId,
          isDeleted: false,
        },
      });

      if (!customer) {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }

      return customer;
    } catch (error) {
      this.logger.error(`Find one customer error: ${error.message}`, error.stack, 'CustomersService');
      throw error;
    }
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto, userId: number, companyId: number) {
    try {
      const customer = await this.findOne(id, companyId);

      Object.assign(customer, updateCustomerDto);
      customer.updatedBy = userId;
      customer.updatedOn = new Date();

      const updatedCustomer = await this.customerRepository.save(customer);
      this.logger.log(`Customer updated: ${updatedCustomer.customerId}`, 'CustomersService');

      return updatedCustomer;
    } catch (error) {
      this.logger.error(`Update customer error: ${error.message}`, error.stack, 'CustomersService');
      throw error;
    }
  }

  async remove(id: number, companyId: number) {
    try {
      const customer = await this.findOne(id, companyId);
      customer.isDeleted = true;
      await this.customerRepository.save(customer);
      this.logger.log(`Customer deleted: ${id}`, 'CustomersService');

      return { message: 'Customer deleted successfully' };
    } catch (error) {
      this.logger.error(`Delete customer error: ${error.message}`, error.stack, 'CustomersService');
      throw error;
    }
  }
}

