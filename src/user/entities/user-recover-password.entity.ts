import {
	Entity,
	Column,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
	PrimaryGeneratedColumn,
	JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_recover_passwords')
export class UserRecoverPassword {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'boolean', default: false })
	used: boolean;

	@Column()
	token: string;

	@Column({ name: 'user_id' })
	userId: number;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'user_id' })
	user: User;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
