import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('me')
  findMine(@CurrentUser() user: { id: string }) {
    return this.subscriptionsService.findMine(user.id);
  }

  @Post()
  subscribe(@CurrentUser() user: { id: string }, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.subscribe(user.id, dto);
  }

  @Post('cancel')
  cancel(@CurrentUser() user: { id: string }) {
    return this.subscriptionsService.cancel(user.id);
  }
}
