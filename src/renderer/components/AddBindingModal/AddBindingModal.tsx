import { useState } from 'react';
import type { CommandAlias } from '../../../main/database/entities/CommandAlias';
import { FieldRow } from './components/FieldRow';
import { TargetPicker } from './components/TargetPicker/TargetPicker';

interface AddBindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (binding: Omit<CommandAlias, 'id'>) => Promise<void>;
}

export const AddBindingModal = ({ isOpen, onClose, onAdd }: AddBindingModalProps) => {
  const [alias, setAlias] = useState('');
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
      if (!alias.trim()) throw new Error('Alias is required');
      if (!target.trim()) throw new Error('Target is required');
      await onAdd({
        alias: alias.trim(),
        actionType,
        target: target.trim(),
        comment: comment.trim(),
      });
      setAlias('');
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
      <div className="w-full max-w-lg rounded-lg bg-white p-5 dark:bg-gray-800">
        <h2 className="mb-3 text-lg font-semibold">Add New Key Binding</h2>
        {error && (
          <div className="mb-4 rounded bg-red-100 p-2 text-red-800 dark:bg-red-900 dark:text-red-100">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <FieldRow label="Alias" htmlFor="alias-input">
            <input
              id="alias-input"
              type="text"
              value={alias}
              onChange={e => setAlias(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 dark:border-gray-600 dark:bg-gray-700"
              placeholder="c o d e"
              required
            />
          </FieldRow>
          <FieldRow label="Action" htmlFor="action-select">
            <select
              id="action-select"
              value={actionType}
              onChange={e => setActionType(e.target.value as typeof actionType)}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 dark:border-gray-600 dark:bg-gray-700"
            >
              <option value="launch-app">Launch Application</option>
              <option value="run-command">Run Command</option>
              <option value="execute-script">Execute Script</option>
            </select>
          </FieldRow>
          <FieldRow label="Target" htmlFor="target-input">
            <TargetPicker actionType={actionType} value={target} onChange={setTarget} isModalOpen={isOpen} />
          </FieldRow>
          <FieldRow label="Comment" htmlFor="comment-input">
            <input
              id="comment-input"
              type="text"
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 dark:border-gray-600 dark:bg-gray-700"
              placeholder="Optional description"
            />
          </FieldRow>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-200 px-4 py-1.5 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding…' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
