import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    type: String,
    required: true,
    description: 'Reset password token',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    type: String,
    required: true,
    description: 'New password',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
