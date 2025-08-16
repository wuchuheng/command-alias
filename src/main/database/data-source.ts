import { DataSource } from 'typeorm';
import packageJson from '../../../package.json';
import { logger } from '../utils/logger';
import { Welcome } from './entities/welcom';
import { CommandAlias } from './entities/CommandAlias';
import { seedDatabase } from './seed';
import { app } from 'electron';
import path from 'path';
const databaseName = `${packageJson.name}-${packageJson.version}.sqlite`;

let db: DataSource;

let isInitialized = false;
export const getIsInitialized = () => isInitialized;

export const initDB = async (): Promise<void> => {
  const isDev = process.env.NODE_ENV === 'development';

  try {
    logger.info('Initializing database connection');
    const databasePath = path.join(app.getPath('userData'), databaseName);

    db = new DataSource({
      type: 'better-sqlite3',
      database: databasePath,
      entities: [Welcome, CommandAlias],
      subscribers: [],
      synchronize: true,
      logging: isDev,
    });

    await db.initialize();

    isInitialized = true;
    logger.info(`Database connection established to ${isDev ? 'dev.sqlite' : databaseName}`);

    // Seed the database after initialization
    await seedDatabase();
  } catch (error) {
    logger.error(`Database initialization error: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

export const getDataSource = () => {
  if (!db || !isInitialized) {
    throw new Error('Database not initialized. Call initialize() first.');
  }
  return db;
};
