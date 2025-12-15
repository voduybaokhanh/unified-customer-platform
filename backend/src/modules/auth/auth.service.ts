// backend/src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomLoggerService } from '../../common/logger/logger.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto, UserDto } from './dto/auth-response.dto';
import { Role } from './dto/register.dto';
import { MessagingService } from '../../messaging/messaging.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private logger: CustomLoggerService,
    private messaging: MessagingService,
  ) {}

  /**
   * Đăng ký user mới
   */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log(`User registration attempt: ${dto.email}`, 'AuthService');
    
    // Kiểm tra email đã tồn tại
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      this.logger.warn(`Registration failed - email already exists: ${dto.email}`, 'AuthService');
      throw new ConflictException('Email đã được sử dụng');
    }

    try {
      // Hash password với 12 rounds (more secure than 10)
      const hashedPassword = await bcrypt.hash(dto.password, 12);

      // Tạo user mới
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          role: dto.role || Role.AGENT,
        },
      });

      // Generate tokens
      const tokens = await this.generateTokens(user);

      this.logger.log(`User registered successfully: ${user.email} (${user.role})`, 'AuthService');
      await this.messaging.publish('auth.user.registered', {
        userId: user.id,
        email: user.email,
        role: user.role,
        occurredAt: new Date().toISOString(),
      });

      return {
        success: true,
        message: 'Đăng ký thành công',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: 3600, // 1 hour
        },
      };
    } catch (error) {
      this.logger.error(`Registration failed for ${dto.email}: ${error.message}`, error.stack, 'AuthService');
      throw error;
    }
  }

  /**
   * Đăng nhập
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    this.logger.log(`Login attempt: ${dto.email}`, 'AuthService');
    
    // Tìm user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      this.logger.warn(`Login failed - user not found: ${dto.email}`, 'AuthService');
      throw new UnauthorizedException('Email hoặc password không đúng');
    }

    // Kiểm tra account active
    if (!user.isActive) {
      this.logger.warn(`Login failed - account deactivated: ${dto.email}`, 'AuthService');
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Login failed - invalid password: ${dto.email}`, 'AuthService');
      throw new UnauthorizedException('Email hoặc password không đúng');
    }

    try {
      // Generate tokens
      const tokens = await this.generateTokens(user);

      this.logger.log(`User logged in successfully: ${user.email} (${user.role})`, 'AuthService');
      await this.messaging.publish('auth.user.logged_in', {
        userId: user.id,
        email: user.email,
        role: user.role,
        occurredAt: new Date().toISOString(),
      });

      return {
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: 3600, // 1 hour
        },
      };
    } catch (error) {
      this.logger.error(`Login failed for ${dto.email}: ${error.message}`, error.stack, 'AuthService');
      throw error;
    }
  }

  /**
   * Validate user từ JWT payload
   */
  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User không hợp lệ');
    }

    return user;
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h',
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
    });

    // Store refresh token in database
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(dto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
      });

      // Find user and verify refresh token matches
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.refreshToken !== dto.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout - invalidate refresh token
   */
  async logout(userId: string): Promise<{ success: boolean; message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    await this.messaging.publish('auth.user.logged_out', {
      userId,
      occurredAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: 'Đăng xuất thành công',
    };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string): Promise<UserDto> {
    const user = await this.validateUser(userId);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Verify token
   */
  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }
}