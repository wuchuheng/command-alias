import { config } from '../../shared/config';
import * as bootloadService from '../services/bootload.service';

/**
 * Get bootloading processing
 */
config.system.getBootloadProgressing.handle(bootloadService.getCurrentProcessing);
