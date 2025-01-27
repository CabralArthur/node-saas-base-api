import { Body, Controller, HttpCode, HttpStatus, Post, Get, Param } from '@nestjs/common';
import { LoginDto } from '../dtos/login.dto';
import { AuthService } from '../services/auth.service';
import { Public } from '../decorators/public.decorator';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequestResetPasswordDto } from '../dtos/request-reset-password.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { RegisterDto } from '../dtos/register.dto';
@Controller('auth')
@ApiTags('Auth Routes')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  @ApiResponse({
    status: 200,
    description: 'Token returned',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @Public()
  @ApiResponse({
    status: 200,
    description: 'User registered successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Passwords do not match',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid user information',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('request-reset-password')
  @Public()
  @ApiResponse({
    status: 200,
    description: 'Password reset requested successfully',
  })
  async requestResetPassword(@Body() requestResetPasswordDto: RequestResetPasswordDto) {
    return this.authService.requestResetPassword(requestResetPasswordDto);
  }

  @Get('validate-reset-password/:token')
  @Public()
  @ApiResponse({
    status: 200,
    description: 'Password reset token is valid',
  })
  async validateResetPassword(@Param('token') token: string) {
    return this.authService.validateResetPassword(token);
  }

  @Post('reset-password')
  @Public()
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
