import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Company } from '../entities/company.entity';
import { S3Service } from '../s3/s3.service';
import { LoggerService } from '../logger/logger.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private s3Service: S3Service,
    private logger: LoggerService,
  ) {}

  async findOne(companyId: number) {
    try {
      const company = await this.companyRepository.findOne({
        where: { companyId },
      });

      if (!company) {
        throw new NotFoundException(`Company with ID ${companyId} not found`);
      }

      return company;
    } catch (error) {
      this.logger.error(`Find company error: ${error.message}`, error.stack, 'CompaniesService');
      throw error;
    }
  }

  async uploadLogo(file: Express.Multer.File, companyId: number) {
    try {
      if (!file) {
        throw new Error('No file uploaded');
      }

      const company = await this.findOne(companyId);

      // Save file temporarily
      const tempPath = path.join(process.cwd(), 'temp', `${Date.now()}-${file.originalname}`);
      const tempDir = path.dirname(tempPath);

      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      fs.writeFileSync(tempPath, file.buffer);

      // Upload to S3
      const logoKey = `companies/${companyId}/logo-${Date.now()}.${file.originalname.split('.').pop()}`;
      const s3Key = await this.s3Service.uploadFile(tempPath, logoKey);

      // Delete temp file
      fs.unlinkSync(tempPath);

      // Update company logo key
      company.logoKey = s3Key;
      await this.companyRepository.save(company);

      this.logger.log(`Logo uploaded for company: ${companyId}`, 'CompaniesService');

      return {
        logoKey: s3Key,
        message: 'Logo uploaded successfully',
      };
    } catch (error) {
      this.logger.error(`Upload logo error: ${error.message}`, error.stack, 'CompaniesService');
      throw error;
    }
  }

  async update(companyId: number, updateCompanyDto: UpdateCompanyDto) {
    try {
      const company = await this.findOne(companyId);

      Object.assign(company, updateCompanyDto);
      const updatedCompany = await this.companyRepository.save(company);

      this.logger.log(`Company updated: ${companyId}`, 'CompaniesService');

      return updatedCompany;
    } catch (error) {
      this.logger.error(`Update company error: ${error.message}`, error.stack, 'CompaniesService');
      throw error;
    }
  }
}

