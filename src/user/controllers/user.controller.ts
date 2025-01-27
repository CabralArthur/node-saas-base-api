import { 
  Controller, 
  Body, 
  Post, 
  Get, 
  Put,
  Delete,
  Param, 
  UseGuards,
  Query
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { AuthUser } from '../../auth/decorators/auth-user.decorator';
import { ActiveUser } from '../../auth/interfaces/active-user.interface';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { SelfOrAdminGuard } from '../../auth/guards/self-or-admin.guard';

@Controller('user')
@ApiTags('User Routes')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(AdminGuard)
  @ApiResponse({
    status: 200,
    description: 'User created successfully',
  })
  async create(@Body() createUserDto: CreateUserDto, @AuthUser() user: ActiveUser) {
    return this.userService.create({
      ...createUserDto,
      logged_user_id: user.id,
      team_id: user.activeTeamId,
      role: 'MEMBER'
    });
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiResponse({
    status: 200,
    description: 'List all users',
  })
  async findAll(@AuthUser() user: ActiveUser) {
    return this.userService.findAll(user.activeTeamId);
  }

  @Get(':id')
  @UseGuards(SelfOrAdminGuard)
  @ApiResponse({
    status: 200,
    description: 'Get user information',
  })
  async findOne(@Param('id') id: string) {
    return this.userService.findById(parseInt(id));
  }

  @Put(':id')
  @UseGuards(SelfOrAdminGuard)
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @AuthUser() user: ActiveUser
  ) {
    return this.userService.update(parseInt(id), updateUserDto, user);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  async remove(@Param('id') id: string, @AuthUser() user: ActiveUser) {
    return this.userService.remove(parseInt(id), user.activeTeamId);
  }
}
