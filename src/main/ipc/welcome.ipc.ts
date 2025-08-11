import { config } from '../../shared/config';
import { Welcome } from '../database/entities/welcom';
import * as welcomeService from '../services/welcome.service';

/**
 * Get welcome
 */
config.welcome.getWelcome.handle(async () => {
  const result = welcomeService.getWelcome();
  return result;
});
