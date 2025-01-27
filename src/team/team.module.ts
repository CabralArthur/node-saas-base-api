import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { Member } from './entities/member.entity';
import { TeamService } from './services/team.service';
import { TeamController } from './controllers/team.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Team, Member])],
  providers: [TeamService],
  controllers: [TeamController],
  exports: [TeamService],
})
export class TeamModule {} 