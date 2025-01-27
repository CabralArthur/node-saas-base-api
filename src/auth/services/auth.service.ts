import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as randomKey from 'random-key';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { LoginDto } from '../dtos/login.dto';
import configuration from '../../config/configuration';
import { ActiveUser } from '../interfaces/active-user.interface';
import { UserService } from '../../user/services/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      await hash(randomKey.generate(8), 10); // avoid user enumerate
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordMatching = await compare(password, user.password);

    if (!isPasswordMatching) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const accessToken = await this.jwtService.signAsync(
      {
        id: user.id,
        name: user.name,
        email: user.email
      } as ActiveUser,
      {
        expiresIn: configuration.jwt.ttl,
        privateKey: configuration.jwt.privateKey,
      },
    );

    return {
      accessToken,
    };
  }
}
