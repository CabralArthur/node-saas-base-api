import { DataSource } from 'typeorm';
import { Plan } from './entities/plan.entity';

export const seedPlans = async (dataSource: DataSource) => {
  const planRepository = dataSource.getRepository(Plan);

  // Check if plans already exist
  const existingPlans = await planRepository.find();
  if (existingPlans.length > 0) {
    return;
  }

  // Create default plans
  const plans = [
    {
      name: 'Monthly',
      price: 20.00,
      trialDays: 14,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Yearly',
      price: 200.00,
      trialDays: 14,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await planRepository.save(plans);
}; 