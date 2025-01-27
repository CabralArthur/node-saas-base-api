import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../../team/entities/member.entity';

@Injectable()
export class SelfOrAdminGuard implements CanActivate {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requestedUserId = parseInt(request.params.id);

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Allow if user is accessing their own data
    if (user.id === requestedUserId) {
      return true;
    }

    // Check if user is admin
    const member = await this.memberRepository.findOne({
      where: {
        userId: user.id,
        teamId: user.activeTeamId,
        role: 'ADMIN',
        deletedAt: null
      }
    });

    if (!member) {
      throw new UnauthorizedException('Unauthorized access');
    }

    return true;
  }
} 