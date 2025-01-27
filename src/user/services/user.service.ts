import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

import { Repository, DataSource } from 'typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';
import { ParsedUserInfo } from '../interfaces/user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,

    private dataSource: DataSource,
  ) {}

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async findUserByEmail(email: string) {
    return this.userRepository.findOne({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        password: true,
      }
    });
  }

  async findById(id: number) {
    const userInfo = await this.userRepository.findOneOrFail({
      where: {
        id
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    const parsedUserInfo = {
      id: userInfo.id,
      name: userInfo.name,
      email: userInfo.email,
    } as ParsedUserInfo;

    return parsedUserInfo;
  }

  async create(userToCreate: CreateUserDto) {
    const userExists = await this.findByEmail(userToCreate.email);

    if (userExists) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = queryRunner.manager.create(User, userToCreate);
      await queryRunner.manager.save(User, user);

      await queryRunner.commitTransaction();

      return true;
    } catch {
      await queryRunner.rollbackTransaction();
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    } finally {
      await queryRunner.release();
    }
  }
}
