import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Plan } from './plan.entity';
import { Team } from '../../team/entities/team.entity';
import { User } from '../../user/entities/user.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'team_id' })
  @Index()
  teamId: number;

  @Column({ name: 'plan_id' })
  @Index()
  planId: number;

  @Column({ name: 'paid_at', nullable: true })
  paidAt: Date;

  @Column({ name: 'canceled_at', nullable: true })
  canceledAt: Date;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'ends_at', nullable: true })
  endsAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: 'TRIAL' })
  @Index()
  status: string;

  @Column({ name: 'stripe_subscription_id', nullable: true })
  @Index()
  stripeSubscriptionId: string;

  @Column({ name: 'stripe_customer_id', nullable: true })
  @Index()
  stripeCustomerId: string;

  @Column({ name: 'stripe_price_id', nullable: true })
  stripePriceId: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @ManyToOne(() => Plan)
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
} 