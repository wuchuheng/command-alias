import { getDataSource } from '../data-source';
import { AppConfig } from '../entities/AppConfig';

/**
 * Get the single AppConfig row (create default if not exists).
 */
export const getOrCreate = async (): Promise<AppConfig> => {
  const repo = getDataSource().getRepository(AppConfig);
  let cfg = await repo.findOne({ where: {} });
  if (!cfg) {
    cfg = repo.create({ prefixKey: 'Space', activationDelay: 500, uiTheme: 'dark' });
    cfg = await repo.save(cfg);
  }
  return cfg;
};

/**
 * Update activation delay value.
 */
export const updateDelay = async (delay: number): Promise<void> => {
  const repo = getDataSource().getRepository(AppConfig);
  let cfg = await repo.findOne({ where: {} });
  if (!cfg) {
    cfg = repo.create({ prefixKey: 'Space', activationDelay: delay, uiTheme: 'dark' });
  } else {
    cfg.activationDelay = delay;
  }
  await repo.save(cfg);
};
