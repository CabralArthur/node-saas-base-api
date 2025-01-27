import { IsEmail, IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    type: String,
    required: true,
    description: 'User name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: String,
    required: true,
    description: 'User email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    type: String,
    required: true,
    description: 'User password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'Team ID',
  })
  @IsNumber()
  @IsOptional()
  team_id?: number;

  @ApiProperty({
    type: String,
    required: false,
    description: 'User role',
  })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'Logged user ID',
  })
  @IsNumber()
  @IsOptional()
  logged_user_id?: number;
}
