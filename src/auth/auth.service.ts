import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Company } from '../entities/company.entity';
import { User } from '../entities/user.entity';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private logger: LoggerService,
  ) {}

  async signup(signupDto: SignupDto) {
    try {
      // Check if user with email already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: signupDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Create company
      const company = this.companyRepository.create({
        companyName: signupDto.companyName,
      });
      const savedCompany = await this.companyRepository.save(company);

      // Hash password
      const hashedPassword = await bcrypt.hash(signupDto.password, 10);

      // Create user with admin role (role_id = 1)
      const user = this.userRepository.create({
        userName: signupDto.userName,
        email: signupDto.email,
        password: hashedPassword,
        mobile: signupDto.mobile,
        companyId: savedCompany.companyId,
        userRoleId: 1, // Admin role
        createdBy: null, // First user, no creator
      });

      const savedUser = await this.userRepository.save(user);

      // Generate JWT token
      const payload = {
        userId: savedUser.userId,
        email: savedUser.email,
        companyId: savedUser.companyId,
        userRoleId: savedUser.userRoleId,
      };

      const token = this.jwtService.sign(payload);

      this.logger.log(`New user signed up: ${savedUser.email}`, 'AuthService');

      return {
        token,
        user: {
          userId: savedUser.userId,
          userName: savedUser.userName,
          email: savedUser.email,
          companyId: savedUser.companyId,
          userRoleId: savedUser.userRoleId,
        },
        company: {
          companyId: savedCompany.companyId,
          companyName: savedCompany.companyName,
        },
      };
    } catch (error) {
      this.logger.error(`Signup error: ${error.message}`, error.stack, 'AuthService');
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: loginDto.email },
        relations: ['company'],
      });

      if (!user || user.isDeleted) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (user.company.isBlocked || user.company.isDeleted) {
        throw new UnauthorizedException('Company is blocked or deleted');
      }

      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        userId: user.userId,
        email: user.email,
        companyId: user.companyId,
        userRoleId: user.userRoleId,
      };

      const token = this.jwtService.sign(payload);

      this.logger.log(`User logged in: ${user.email}`, 'AuthService');

      return {
        token,
        user: {
          userId: user.userId,
          userName: user.userName,
          email: user.email,
          companyId: user.companyId,
          userRoleId: user.userRoleId,
        },
      };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`, error.stack, 'AuthService');
      throw error;
    }
  }

  async validateUser(userId: number): Promise<User> {
    return await this.userRepository.findOne({
      where: { userId },
      relations: ['company'],
    });
  }
}

