import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Subscription } from './subscription.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'subscription_id' })
  @Index()
  subscriptionId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column()
  status: string;

  @Column({ name: 'payment_method' })
  paymentMethod: string;

  @Column({ name: 'stripe_payment_id', nullable: true })
  stripePaymentId: string;

  @Column({ name: 'invoice_link', nullable: true })
  invoiceLink: string;

  @Column({ name: 'paid_at', nullable: true })
  paidAt: Date;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Subscription)
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;
} 