import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guards';
import { SubscriptionService } from '../services/subscription.service';
import { AuthUser } from '../../auth/decorators/auth-user.decorator';
import { ActiveUser } from '../../auth/interfaces/active-user.interface';

@Controller('subscription')
@ApiTags('Subscription Routes')
@UseGuards(AuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('checkout')
  @ApiResponse({
    status: 200,
    description: 'Checkout session created successfully',
  })
  async checkout(
    @Body() data: { planModel: string },
    @AuthUser() user: ActiveUser,
  ) {
    return this.subscriptionService.checkout(user.activeTeamId, data);
  }

  @Post('cancel')
  @ApiResponse({
    status: 200,
    description: 'Subscription canceled successfully',
  })
  async cancel(@AuthUser() user: ActiveUser) {
    return this.subscriptionService.cancel(user.activeTeamId);
  }

  @Post('renew')
  @ApiResponse({
    status: 200,
    description: 'Subscription renewed successfully',
  })
  async renew(@AuthUser() user: ActiveUser) {
    return this.subscriptionService.renew(user.activeTeamId);
  }
} 