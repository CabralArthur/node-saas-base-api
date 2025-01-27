import { Body, Controller, HttpCode, HttpStatus, Post, Get, Param } from '@nestjs/common';
import { LoginDto } from '../dtos/login.dto';
import { AuthService } from '../services/auth.service';
import { Public } from '../decorators/public.decorator';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequestResetPasswordDto } from '../../user/dtos/request-reset-password.dto';
import { ResetPasswordDto } from '../../user/dtos/reset-password.dto';

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
