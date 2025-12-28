import { Controller, Get, Post, Body, Delete, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { RateCalculationDto } from './dto/rate-calculation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  addToCart(@Body() addToCartDto: AddToCartDto, @CurrentUser() user: any) {
    return this.cartService.addToCart(addToCartDto, user.userId, user.companyId);
  }

  @Get()
  getCart(@CurrentUser() user: any) {
    return this.cartService.getCart(user.userId, user.companyId);
  }

  @Delete()
  clearCart(@CurrentUser() user: any) {
    return this.cartService.clearCart(user.userId, user.companyId);
  }

  @Post('calculate-rate')
  calculateRate(@Body() rateCalculationDto: RateCalculationDto) {
    return this.cartService.calculateRate(rateCalculationDto);
  }
}

