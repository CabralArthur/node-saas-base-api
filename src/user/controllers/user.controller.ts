import { Controller, Body, Post, Get, Param } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { AuthUser } from '../../auth/decorators/auth-user.decorator';
import { ActiveUser } from '../../auth/interfaces/active-user.interface';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequestResetPasswordDto } from '../dtos/request-reset-password.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';

@Controller('user')
@ApiTags('User Routes')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Public()
  @ApiResponse({
    status: 200,
    description: 'User created successfully',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('/info')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'User information',
  })
  @ApiBearerAuth()
  async getInfo(@AuthUser() user: ActiveUser) {
    return this.userService.findById(user.id);
  }

  @Post('/request-reset-password')
  @Public()
  @ApiResponse({
    status: 200,
    description: 'Password reset requested successfully',
  })
  async requestResetPassword(@Body() requestResetPasswordDto: RequestResetPasswordDto) {
    return this.userService.requestResetPassword(requestResetPasswordDto);
  }

  @Get('/validate-reset-password/:token')
  @Public()
  @ApiResponse({
    status: 200,
    description: 'Password reset token is valid',
  })
  async validateResetPassword(@Param('token') token: string) {
    return this.userService.validateResetPassword(token);
  }

  @Post('/reset-password')
  @Public()
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.userService.resetPassword(resetPasswordDto);
  }

  @Get('/validate-recover-password/:token')
  @Public()
  async validateRecoverPassword(@Param('token') token: string) {
    return this.userService.validateResetPassword(token);
  }
}
