import { useEffect, useState } from 'react';
import type { KeyBinding } from '../../../main/database/entities/KeyBinding';
import { AddBindingModal } from '../../components/AddBindingModal';

export const Home = () => {
  const [bindings, setBindings] = useState<KeyBinding[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadBindings = async () => {
    try {
      const data = await window.electron.spaceTrigger.getKeyBindings();
      setBindings(data);
    } catch (error) {
      console.error('Binding load failed', error);
    }
  };

  useEffect(() => {
    loadBindings();
  }, []);

  const handleAddBinding = async (binding: Omit<KeyBinding, 'id'>) => {
    try {
      await window.electron.spaceTrigger.addBinding(binding);
      await loadBindings();
    } catch (error) {
      console.error('Failed to add binding', error);
      throw error;
    }
  };

  return (
    <>
      <AddBindingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddBinding} />
      <div className="mx-auto max-w-4xl p-4">
        <h1 className="mb-4 text-2xl font-bold">SpaceTrigger Key Bindings</h1>

        {/* Key bindings table */}
        <div className="mb-4 overflow-hidden rounded-lg border">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="border p-2 text-left">Sequence</th>
                <th className="border p-2 text-left">Action</th>
                <th className="border p-2 text-left">Comment</th>
              </tr>
            </thead>
            <tbody>
              {bindings.map(binding => (
                <tr key={binding.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="border p-2">{binding.sequence}</td>
                  <td className="border p-2">{binding.actionType}</td>
                  <td className="border p-2">{binding.comment || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            onClick={() => setIsModalOpen(true)}
          >
            Add Binding
          </button>
          <button className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
            Settings
          </button>
          <button className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
            Import/Export
          </button>
        </div>
      </div>
    </>
  );
};
