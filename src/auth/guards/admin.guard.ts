import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../../team/entities/member.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const member = await this.memberRepository.findOne({
      where: {
        userId: user.id,
        teamId: user.activeTeamId,
        role: 'ADMIN',
        deletedAt: null
      }
    });

    if (!member) {
      throw new UnauthorizedException('User is not an admin');
    }

    return true;
  }
} 