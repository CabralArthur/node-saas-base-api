import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SwitchTeamDto {
  @ApiProperty({
    type: Number,
    required: true,
    description: 'Team ID to switch to',
  })
  @IsNumber()
  @IsNotEmpty()
  team_id: number;
} 