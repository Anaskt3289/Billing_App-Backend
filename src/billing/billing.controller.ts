import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

@Controller('bills')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post()
  create(@Body() createBillDto: CreateBillDto, @CurrentUser() user: any) {
    return this.billingService.createBill(
      createBillDto,
      user.userId,
      user.companyId,
    );
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.billingService.findAll(user.companyId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.billingService.findOne(id, user.companyId);
  }

  @Get(':id/pdf')
  getBillPdf(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.billingService.getBillPdfUrl(id, user.companyId);
  }

  @Post(':id/share')
  shareBill(
    @Param('id', ParseIntPipe) id: number,
    @Query('mobile') mobile: string,
    @CurrentUser() user: any,
  ) {
    return this.billingService.shareBillViaWhatsApp(id, user.companyId, mobile);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.billingService.deleteBill(id, user.companyId);
  }
}

