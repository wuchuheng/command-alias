import { Welcome } from '../database/entities/welcom';
import * as welcomeRepository from '../database/repositories/welcom.repository';

export const getWelcome = async (): Promise<Welcome> => await welcomeRepository.getWelcomeMessage();
