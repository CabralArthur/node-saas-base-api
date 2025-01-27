import { Controller } from '@nestjs/common';
import { TeamService } from '../services/team.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('teams')
@ApiTags('Team Routes')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}
} 