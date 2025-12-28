import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private logger: LoggerService,
  ) {}

  async create(createProductDto: CreateProductDto, userId: number, companyId: number) {
    try {
      // Check if product code already exists for this company
      const existingProduct = await this.productRepository.findOne({
        where: {
          productCode: createProductDto.productCode,
          companyId,
        },
      });

      if (existingProduct) {
        throw new BadRequestException('Product code already exists for this company');
      }

      const product = this.productRepository.create({
        ...createProductDto,
        companyId,
        createdBy: userId,
        quantity: createProductDto.quantity || 0,
      });

      const savedProduct = await this.productRepository.save(product);
      this.logger.log(`Product created: ${savedProduct.productId}`, 'ProductsService');

      return savedProduct;
    } catch (error) {
      this.logger.error(`Create product error: ${error.message}`, error.stack, 'ProductsService');
      throw error;
    }
  }

  async findAll(filterDto: FilterProductDto, companyId: number) {
    try {
      const queryBuilder = this.productRepository.createQueryBuilder('product');

      // Always filter by company_id
      queryBuilder.where('product.company_id = :companyId', { companyId });

      // Apply additional filters
      if (filterDto.companyId && filterDto.companyId !== companyId) {
        // If different company_id is provided and user doesn't have access, ignore it
        // Or you can throw an error based on your business logic
      }

      if (filterDto.searchTerm) {
        queryBuilder.andWhere(
          '(product.product_name LIKE :searchTerm OR product.product_code LIKE :searchTerm)',
          { searchTerm: `%${filterDto.searchTerm}%` },
        );
      }

      queryBuilder.orderBy('product.created_on', 'DESC');

      const products = await queryBuilder.getMany();
      return products;
    } catch (error) {
      this.logger.error(`Find all products error: ${error.message}`, error.stack, 'ProductsService');
      throw error;
    }
  }

  async findOne(id: number, companyId: number) {
    try {
      const product = await this.productRepository.findOne({
        where: {
          productId: id,
          companyId,
        },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      return product;
    } catch (error) {
      this.logger.error(`Find one product error: ${error.message}`, error.stack, 'ProductsService');
      throw error;
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto, userId: number, companyId: number) {
    try {
      const product = await this.findOne(id, companyId);

      // Check if product code is being updated and if it conflicts
      if (updateProductDto.productCode && updateProductDto.productCode !== product.productCode) {
        const existingProduct = await this.productRepository.findOne({
          where: {
            productCode: updateProductDto.productCode,
            companyId,
          },
        });

        if (existingProduct && existingProduct.productId !== id) {
          throw new BadRequestException('Product code already exists for this company');
        }
      }

      Object.assign(product, updateProductDto);
      product.updatedBy = userId;
      product.updatedOn = new Date();

      const updatedProduct = await this.productRepository.save(product);
      this.logger.log(`Product updated: ${updatedProduct.productId}`, 'ProductsService');

      return updatedProduct;
    } catch (error) {
      this.logger.error(`Update product error: ${error.message}`, error.stack, 'ProductsService');
      throw error;
    }
  }

  async remove(id: number, companyId: number) {
    try {
      const product = await this.findOne(id, companyId);
      await this.productRepository.remove(product);
      this.logger.log(`Product deleted: ${id}`, 'ProductsService');

      return { message: 'Product deleted successfully' };
    } catch (error) {
      this.logger.error(`Delete product error: ${error.message}`, error.stack, 'ProductsService');
      throw error;
    }
  }
}

