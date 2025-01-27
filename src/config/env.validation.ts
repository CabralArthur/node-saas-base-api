import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  @IsOptional()
  DB_PORT: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  DB_CONNECTION: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  DB_CONNECTION_MIN: number;

  @IsBoolean()
  @IsOptional()
  DB_LOGGING: boolean;

  @IsString()
  @IsNotEmpty()
  JWT_PRIVATE_KEY: string;

  @IsString()
  @IsNotEmpty()
  JWT_PUBLIC_KEY: string;

  @IsNumber()
  @Min(1000)
  JWT_ACCESS_TOKEN_TTL: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
