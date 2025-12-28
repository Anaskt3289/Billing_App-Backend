import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { Bill } from '../entities/bill.entity';
import { BillItem } from '../entities/bill-item.entity';
import { Cart } from '../entities/cart.entity';
import { CreateBillDto } from './dto/create-bill.dto';
import { S3Service } from '../s3/s3.service';
import { LoggerService } from '../logger/logger.service'; 

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
    @InjectRepository(BillItem)
    private billItemRepository: Repository<BillItem>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    private s3Service: S3Service,
    private logger: LoggerService,
  ) {}

  async createBill(createBillDto: CreateBillDto, userId: number, companyId: number) {
    try {
      // Create bill
      const bill = this.billRepository.create({
        companyId,
        customerId: createBillDto.customerId || null,
        totalAmount: createBillDto.totalAmount,
        createdBy: userId,
      });

      const savedBill = await this.billRepository.save(bill);

      // Create bill items
      const billItems = [];
      for (const item of createBillDto.items) {
        const billItem = this.billItemRepository.create({
          billId: savedBill.billId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        });
        billItems.push(await this.billItemRepository.save(billItem));
      }

      // Generate PDF
      const pdfKey = await this.generateBillPdf(savedBill.billId, companyId);

      // Update bill with PDF key
      savedBill.billPdf = pdfKey;
      await this.billRepository.save(savedBill);

      this.logger.log(`Bill created: ${savedBill.billId}`, 'BillingService');

      return savedBill;
    } catch (error) {
      this.logger.error(`Create bill error: ${error.message}`, error.stack, 'BillingService');
      throw error;
    }
  }

  async generateBillPdf(billId: number, companyId: number): Promise<string> {
    try {
      const bill = await this.billRepository.findOne({
        where: { billId, companyId },
        relations: ['items', 'items.product', 'customer', 'company'],
      });

      if (!bill) {
        throw new NotFoundException(`Bill with ID ${billId} not found`);
      }

      // Read HTML template
      const templatePath = path.join(process.cwd(), 'templates', 'bill-template.html');
      let htmlTemplate = '';

      if (fs.existsSync(templatePath)) {
        htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
      } else {
        // Default template if file doesn't exist
        htmlTemplate = this.getDefaultBillTemplate();
      }

      // Compile template with Handlebars
      const template = handlebars.compile(htmlTemplate);
      const html = template({
        bill,
        billDate: new Date(bill.createdOn).toLocaleDateString(),
        billTime: new Date(bill.createdOn).toLocaleTimeString(),
      });

      // Generate PDF using Puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      await browser.close();

      // Upload to S3
      const pdfKey = `bills/${companyId}/${billId}-${Date.now()}.pdf`;
      await this.s3Service.uploadBuffer(pdfBuffer, pdfKey, 'application/pdf');

      this.logger.log(`Bill PDF generated: ${pdfKey}`, 'BillingService');

      return pdfKey;
    } catch (error) {
      this.logger.error(`Generate PDF error: ${error.message}`, error.stack, 'BillingService');
      throw error;
    }
  }

  async getBillPdfUrl(billId: number, companyId: number): Promise<string> {
    try {
      const bill = await this.billRepository.findOne({
        where: { billId, companyId, isDeleted: false },
      });

      if (!bill || !bill.billPdf) {
        throw new NotFoundException(`Bill PDF not found for bill ID ${billId}`);
      }

      return await this.s3Service.getSignedUrl(bill.billPdf, 3600); // 1 hour expiry
    } catch (error) {
      this.logger.error(`Get PDF URL error: ${error.message}`, error.stack, 'BillingService');
      throw error;
    }
  }

  async shareBillViaWhatsApp(billId: number, companyId: number, mobileNumber: string) {
    try {
      const pdfUrl = await this.getBillPdfUrl(billId, companyId);
      
      // WhatsApp share URL
      const whatsappUrl = `https://wa.me/${mobileNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Your bill is ready. Download here: ${pdfUrl}`)}`;

      this.logger.log(`WhatsApp share URL generated for bill: ${billId}`, 'BillingService');

      return {
        whatsappUrl,
        pdfUrl,
        message: 'Bill shared via WhatsApp',
      };
    } catch (error) {
      this.logger.error(`Share via WhatsApp error: ${error.message}`, error.stack, 'BillingService');
      throw error;
    }
  }

  async findAll(companyId: number) {
    try {
      return await this.billRepository.find({
        where: {
          companyId,
          isDeleted: false,
        },
        relations: ['customer', 'items', 'items.product'],
        order: {
          createdOn: 'DESC',
        },
      });
    } catch (error) {
      this.logger.error(`Find all bills error: ${error.message}`, error.stack, 'BillingService');
      throw error;
    }
  }

  async findOne(billId: number, companyId: number) {
    try {
      const bill = await this.billRepository.findOne({
        where: {
          billId,
          companyId,
          isDeleted: false,
        },
        relations: ['customer', 'items', 'items.product', 'company'],
      });

      if (!bill) {
        throw new NotFoundException(`Bill with ID ${billId} not found`);
      }

      return bill;
    } catch (error) {
      this.logger.error(`Find one bill error: ${error.message}`, error.stack, 'BillingService');
      throw error;
    }
  }

  async deleteBill(billId: number, companyId: number) {
    try {
      const bill = await this.findOne(billId, companyId);
      bill.isDeleted = true;
      await this.billRepository.save(bill);
      this.logger.log(`Bill deleted: ${billId}`, 'BillingService');

      return { message: 'Bill deleted successfully' };
    } catch (error) {
      this.logger.error(`Delete bill error: ${error.message}`, error.stack, 'BillingService');
      throw error;
    }
  }

  private getDefaultBillTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Bill</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .bill-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        .bill-details {
            width: 48%;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        .total {
            text-align: right;
            font-size: 18px;
            font-weight: bold;
            margin-top: 20px;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">{{bill.company.companyName}}</div>
    </div>
    
    <div class="bill-info">
        <div class="bill-details">
            <p><strong>Bill ID:</strong> {{bill.billId}}</p>
            <p><strong>Date:</strong> {{billDate}}</p>
            <p><strong>Time:</strong> {{billTime}}</p>
        </div>
        {{#if bill.customer}}
        <div class="bill-details">
            <p><strong>Customer:</strong> {{bill.customer.customerName}}</p>
            <p><strong>Mobile:</strong> {{bill.customer.customerMobile}}</p>
        </div>
        {{/if}}
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Product</th>
                <th>Code</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            {{#each bill.items}}
            <tr>
                <td>{{this.product.productName}}</td>
                <td>{{this.product.productCode}}</td>
                <td>{{this.quantity}} {{this.product.uom}}</td>
                <td>₹{{this.unitPrice}}</td>
                <td>₹{{this.totalPrice}}</td>
            </tr>
            {{/each}}
        </tbody>
    </table>
    
    <div class="total">
        <p>Grand Total: ₹{{bill.totalAmount}}</p>
    </div>
    
    <div class="footer">
        <p>Thank you for your business!</p>
    </div>
</body>
</html>
    `;
  }
}

