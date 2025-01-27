import { Controller, Body, Post, Get } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { AuthUser } from '../../auth/decorators/auth-user.decorator';
import { ActiveUser } from '../../auth/interfaces/active-user.interface';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

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
}
