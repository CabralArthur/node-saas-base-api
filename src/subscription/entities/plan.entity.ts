import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'trial_days', default: 0 })
  trialDays: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;
} 