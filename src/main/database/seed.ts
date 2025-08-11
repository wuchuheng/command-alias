import { logger } from '../utils/logger';
import { getDataSource } from './data-source';
import { Welcome } from './entities/welcom';

/**
 * Seed data for the welcome table
 */
const defaultWelcomTitle = [{ title: 'Hello, this is a welcome message from database.' }];

/**
 * Seeds the bucket table with initial data
 */
export const seedBucketTable = async (): Promise<void> => {
  try {
    // 1. Input handling
    const dataSource = getDataSource();
    const welcomRepository = dataSource.getRepository(Welcome);

    // 1.1 Check if data already exists
    const existingCount = await welcomRepository.count();
    if (existingCount > 0) {
      logger.info(`Welcom table already contains ${existingCount} records, skipping seed`);
      return;
    }

    // 2. Core processing
    // 2.1 Put data into the welcome entity
    const welcomeEntities = defaultWelcomTitle.map(welcomData => {
      const welcome = new Welcome();
      welcome.title = welcomData.title;
      return welcome;
    });

    // 2.2 Save buckets to database
    await welcomRepository.save(welcomeEntities);

    // 3. Output handling
    logger.info(`Successfully seeded welcom table with ${welcomeEntities.length} records`);
  } catch (error) {
    logger.error(`Error seeding bucket table: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

/**
 * Runs all seed functions
 */
export const seedDatabase = async (): Promise<void> => {
  try {
    logger.info('Starting database seeding');

    // Add all seeding functions here
    await seedBucketTable();

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error(`Database seeding failed: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};
