import { useState } from 'react';
import type { KeyBinding } from '../../main/database/entities/KeyBinding';

interface AddBindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (binding: Omit<KeyBinding, 'id'>) => Promise<void>;
}

export const AddBindingModal = ({ isOpen, onClose, onAdd }: AddBindingModalProps) => {
  const [sequence, setSequence] = useState('');
  const [actionType, setActionType] = useState<'launch-app' | 'run-command' | 'execute-script'>('launch-app');
  const [target, setTarget] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // 1. Input validation
      if (!sequence.trim()) {
        throw new Error('Sequence is required');
      }
      if (!target.trim()) {
        throw new Error('Target is required');
      }

      // 2. Core processing - add binding
      await onAdd({
        sequence: sequence.trim(),
        actionType,
        target: target.trim(),
        comment: comment.trim(),
      });

      // 3. Reset form and close
      setSequence('');
      setTarget('');
      setComment('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add binding');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold">Add New Key Binding</h2>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-2 text-red-800 dark:bg-red-900 dark:text-red-100">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block font-medium">Sequence</label>
            <input
              type="text"
              value={sequence}
              onChange={e => setSequence(e.target.value)}
              className="w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700"
              placeholder="e.g. c o d e"
              required
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block font-medium">Action Type</label>
            <select
              value={actionType}
              onChange={e => setActionType(e.target.value as any)}
              className="w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700"
            >
              <option value="launch-app">Launch Application</option>
              <option value="run-command">Run Command</option>
              <option value="execute-script">Execute Script</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="mb-2 block font-medium">Target</label>
            <input
              type="text"
              value={target}
              onChange={e => setTarget(e.target.value)}
              className="w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700"
              placeholder="Path or command"
              required
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block font-medium">Comment (Optional)</label>
            <input
              type="text"
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700"
              placeholder="Description"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Binding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
