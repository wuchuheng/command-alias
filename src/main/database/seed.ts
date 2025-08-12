import { logger } from '../utils/logger';
import { getDataSource } from './data-source';
import { Welcome } from './entities/welcom';
import { AppConfig } from './entities/AppConfig';
import { KeyBinding } from './entities/KeyBinding';

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

    // Ensure AppConfig exists
    const ds = getDataSource();
    const appCfgRepo = ds.getRepository(AppConfig);
    const hasCfg = await appCfgRepo.count();
    if (!hasCfg) {
      const cfg = appCfgRepo.create({ prefixKey: 'Space', activationDelay: 500, uiTheme: 'dark' });
      await appCfgRepo.save(cfg);
      logger.info('Seeded default AppConfig');
    }

    // Optional: seed a sample key binding if none exists
    const kbRepo = ds.getRepository(KeyBinding);
    const kbCount = await kbRepo.count();
    if (!kbCount) {
      const sample = kbRepo.create({
        sequence: 'c o d e',
        actionType: 'launch-app',
        target: 'C:\\Program Files\\Microsoft VS Code\\Code.exe',
        comment: 'Launch Visual Studio Code',
      });
      await kbRepo.save(sample);
      logger.info('Seeded sample KeyBinding');
    }

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error(`Database seeding failed: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};
