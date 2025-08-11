import { getDataSource } from '../data-source';
import { Welcome } from '../entities/welcom';

/**
 * Get the welcome message
 */
export const getWelcomeMessage = async (): Promise<Welcome> => {
  const welcomRepository = getDataSource().getRepository(Welcome);
  const welcom = await welcomRepository.find({
    take: 1,
  });
  return welcom[0];
};
