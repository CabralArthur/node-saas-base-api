import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { ParsedUserInfo } from '../interfaces/user.interface';
import { Member } from '../../team/entities/member.entity';
import { ActiveUser } from '../../auth/interfaces/active-user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Member) private memberRepository: Repository<Member>,
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
    const userInfo = await this.userRepository.findOne({
      where: {
        id,
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    if (!userInfo) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const parsedUserInfo = {
      id: userInfo.id,
      name: userInfo.name,
      email: userInfo.email,
    } as ParsedUserInfo;

    return parsedUserInfo;
  }

  async create(userToCreate: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if user exists
      let user = await this.userRepository.findOne({
        where: {
          email: userToCreate.email,
          deletedAt: null
        }
      });

      // If user exists and team_id is provided, check team membership
      if (user && userToCreate.team_id) {
        const existingMember = await this.memberRepository.findOne({
          where: {
            teamId: userToCreate.team_id,
            userId: user.id,
            deletedAt: null
          }
        });

        if (existingMember) {
          throw new HttpException('User is already a member of this team', HttpStatus.CONFLICT);
        }
      }

      // If user doesn't exist, create one
      if (!user) {
        user = queryRunner.manager.create(User, {
          name: userToCreate.name,
          email: userToCreate.email,
          password: userToCreate.password,
          activeTeamId: userToCreate.team_id
        });
        
        user = await queryRunner.manager.save(User, user);
      }

      // If team_id is provided, create team membership
      if (userToCreate.team_id) {
        const member = queryRunner.manager.create(Member, {
          teamId: userToCreate.team_id,
          userId: user.id,
          role: 'MEMBER',
          createdAt: new Date(),
          updatedAt: new Date()
        });

        await queryRunner.manager.save(Member, member);
      }

      await queryRunner.commitTransaction();

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(teamId: number) {
    const members = await this.memberRepository.find({
      where: {
        teamId,
        deletedAt: null
      },
      relations: ['user']
    });

    return members.map(member => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.role
    }));
  }

  async update(id: number, updateUserDto: UpdateUserDto, user: ActiveUser) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userToUpdate = await this.userRepository.findOne({
        where: { id, deletedAt: null }
      });

      if (!userToUpdate) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // If updating email, check if it's already taken
      if (updateUserDto.email && updateUserDto.email !== userToUpdate.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: updateUserDto.email, deletedAt: null }
        });

        if (existingUser) {
          throw new HttpException('Email already in use', HttpStatus.CONFLICT);
        }
      }

      // Update user
      await queryRunner.manager.update(User, id, updateUserDto);

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number, teamId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const member = await this.memberRepository.findOne({
        where: {
          userId: id,
          teamId,
          deletedAt: null
        }
      });

      if (!member) {
        throw new HttpException('User not found in team', HttpStatus.NOT_FOUND);
      }

      // Soft delete member
      await queryRunner.manager.update(Member, { id: member.id }, { deletedAt: new Date() });

      // If user has no other active team memberships, soft delete user
      const otherMemberships = await this.memberRepository.count({
        where: {
          userId: id,
          deletedAt: null,
          id: member.id
        }
      });

      if (otherMemberships === 0) {
        await queryRunner.manager.update(User, id, { deletedAt: new Date() });
      }

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
