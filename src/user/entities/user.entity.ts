import { hash } from 'bcrypt';
import {
  Entity,
  Column,
  OneToMany,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  Transaction,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Exclude({ toPlainOnly: true })
  @Column({ select: false })
  password: string;

  @Column({ name: 'active_team_id', nullable: true })
  activeTeamId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10);
  }

  @BeforeUpdate()
  async updatePassword() {
    if (this.password) {
      this.password = await hash(this.password, 10);
    }
  }
}
