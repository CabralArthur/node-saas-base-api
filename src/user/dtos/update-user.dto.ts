import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    type: String,
    required: false,
    description: 'User name',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'User email',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'User password',
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'New password',
  })
  @IsString()
  @IsOptional()
  new_password?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Confirm new password',
  })
  @IsString()
  @IsOptional()
  confirm_new_password?: string;
} 
