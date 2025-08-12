import { getDataSource } from '../data-source';
import { KeyBinding } from '../entities/KeyBinding';

/**
 * Fetch all key bindings ordered by sequence.
 */
export const getAll = async (): Promise<KeyBinding[]> => {
  const repo = getDataSource().getRepository(KeyBinding);
  const items = await repo.find({ order: { sequence: 'ASC' } });
  return items;
};

/**
 * Create a new key binding.
 * @param binding Binding without id
 */
export const create = async (binding: Omit<KeyBinding, 'id'>): Promise<KeyBinding> => {
  const repo = getDataSource().getRepository(KeyBinding);
  const entity = repo.create(binding);
  return await repo.save(entity);
};
