import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { Product } from '../entities/product.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { RateCalculationDto, RateItemDto } from './dto/rate-calculation.dto';
import { UOM } from '../entities/product.entity';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private logger: LoggerService,
  ) {}

  async addToCart(addToCartDto: AddToCartDto, userId: number, companyId: number) {
    try {
      // Find or create cart
      let cart = await this.cartRepository.findOne({
        where: {
          companyId,
          createdBy: userId,
          isDraft: true,
        },
        relations: ['items', 'items.product'],
      });

      if (!cart) {
        cart = this.cartRepository.create({
          companyId,
          createdBy: userId,
          isDraft: addToCartDto.isDraft,
        });
        cart = await this.cartRepository.save(cart);
      } else {
        // Clear existing items if not draft
        if (!addToCartDto.isDraft) {
          await this.cartItemRepository.delete({ cartId: cart.cartId });
        }
      }

      // Add items to cart
      const cartItems = [];
      for (const item of addToCartDto.items) {
        const product = await this.productRepository.findOne({
          where: {
            productId: item.productId,
            companyId,
          },
        });

        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }

        const calculatedPrice = this.calculatePrice(
          product.basePrice,
          item.quantity,
          product.uom,
        );

        const cartItem = this.cartItemRepository.create({
          cartId: cart.cartId,
          productId: item.productId,
          quantity: item.quantity,
          price: calculatedPrice,
        });

        cartItems.push(await this.cartItemRepository.save(cartItem));
      }

      cart.items = cartItems;
      cart.isDraft = addToCartDto.isDraft;
      cart = await this.cartRepository.save(cart);

      this.logger.log(`Cart updated: ${cart.cartId}`, 'CartService');

      return cart;
    } catch (error) {
      this.logger.error(`Add to cart error: ${error.message}`, error.stack, 'CartService');
      throw error;
    }
  }

  async getCart(userId: number, companyId: number) {
    try {
      const cart = await this.cartRepository.findOne({
        where: {
          companyId,
          createdBy: userId,
          isDraft: true,
        },
        relations: ['items', 'items.product'],
      });

      return cart || { items: [], cartId: null };
    } catch (error) {
      this.logger.error(`Get cart error: ${error.message}`, error.stack, 'CartService');
      throw error;
    }
  }

  async calculateRate(rateCalculationDto: RateCalculationDto) {
    try {
      const calculatedItems = rateCalculationDto.items.map((item: RateItemDto) => {
        const totalPrice = this.calculatePrice(item.basePrice, item.quantity, item.uom);
        return {
          basePrice: item.basePrice,
          quantity: item.quantity,
          uom: item.uom,
          totalPrice,
        };
      });

      const grandTotal = calculatedItems.reduce(
        (sum, item) => sum + Number(item.totalPrice),
        0,
      );

      return {
        items: calculatedItems,
        grandTotal,
      };
    } catch (error) {
      this.logger.error(`Rate calculation error: ${error.message}`, error.stack, 'CartService');
      throw error;
    }
  }

  private calculatePrice(basePrice: number, quantity: number, uom: UOM): number {
    switch (uom) {
      case UOM.PER_PIECE:
        return basePrice * quantity;
      case UOM.KG:
        return basePrice * quantity;
      case UOM.GRAM:
        return basePrice * (quantity / 1000); // Convert grams to kg
      case UOM.LITER:
        return basePrice * quantity;
      case UOM.METER:
        return basePrice * quantity;
      default:
        return basePrice * quantity;
    }
  }

  async clearCart(userId: number, companyId: number) {
    try {
      const cart = await this.cartRepository.findOne({
        where: {
          companyId,
          createdBy: userId,
          isDraft: true,
        },
      });

      if (cart) {
        await this.cartItemRepository.delete({ cartId: cart.cartId });
        await this.cartRepository.remove(cart);
        this.logger.log(`Cart cleared: ${cart.cartId}`, 'CartService');
      }

      return { message: 'Cart cleared successfully' };
    } catch (error) {
      this.logger.error(`Clear cart error: ${error.message}`, error.stack, 'CartService');
      throw error;
    }
  }
}

