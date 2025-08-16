import React, { useState } from 'react';
import type { CommandAlias } from '../../../main/database/entities/CommandAlias';
import { FieldRow } from './components/FieldRow';
import { TargetPicker } from './components/TargetPicker/TargetPicker';

interface BindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (binding: Omit<CommandAlias, 'id'>) => Promise<void>;
  value?: Omit<CommandAlias, 'id'>;
  confirmText?: string;
  cancelText?: string;
  title: string;
}

/**
 * Initializes the binding modal with the provided values.
 * @param param0 - The props for the binding modal.
 * @returns
 */
export const BindingModal: React.FC<BindingModalProps> = ({ isOpen, onClose, onSubmit, ...props }) => {
  const [value, setValue] = useState<Omit<CommandAlias, 'id'>>(
    props.value || { alias: '', actionType: 'launch-app', target: '', comment: '' }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError({});
    try {
      const alias = value.alias.trim();
      if (!alias) throw new Error('Alias is required');
      const existedAlias = await window.electron.commandAlias.checkAlias(alias);
      if (existedAlias && existedAlias !== props.value?.alias) {
        const msg = `The alias ${alias} is conflicted with ${existedAlias} alias. Please choose another alias.
          `;
        setError(prev => ({ ...prev, alias: msg }));
        return;
      }
      const target = value.target.trim();
      if (!target) {
        const msg = 'Target is required';
        setError(prev => ({ ...prev, target: msg }));
        return;
      }

      await onSubmit({
        alias,
        actionType: value.actionType,
        target,
        comment: value.comment.trim(),
      });
      setValue({ alias: '', actionType: 'launch-app', target: '', comment: '' });
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add binding';
      setError(prev => ({ ...prev, form: msg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const onUpdateTarget = async (newValue: string, appName?: string) => {
    setValue(v => ({ ...v, target: newValue }));

    // 2.2 If the comment is empty, and the action type is "launch-app", then set the comment is `Open <app name>`
    if (!value.comment && value.actionType === 'launch-app') {
      // Support both '/' and '\' as path separators
      if (!appName) {
        const parts = newValue.split(/[/\\]/);
        appName = parts.pop() || '';
        // Remove the suffix
        appName = appName.split('.')[0];
      }

      setValue(v => ({ ...v, comment: `Open ${appName}` }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-5 dark:bg-gray-800">
        <h2 className="mb-3 text-lg font-semibold">{props.title}</h2>

        {Object.keys(error).includes('form') && (
          <div className="mb-4 rounded bg-red-100 p-2 text-red-800 dark:bg-red-900 dark:text-red-100">
            {error['form']}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <FieldRow label="Alias" htmlFor="alias-input">
            <input
              id="alias-input"
              type="text"
              value={value.alias}
              onChange={e => {
                setValue(v => ({ ...v, alias: e.target.value }));
                e.target.setCustomValidity('');
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 dark:border-gray-600 dark:bg-gray-700"
              placeholder="c o d e"
              required
              ref={el => {
                if (!el) return;

                if (Object.keys(error).includes('alias')) {
                  el.setCustomValidity(error['alias']);
                  el.reportValidity();
                } else if (el) {
                  el.setCustomValidity('');
                }
              }}
            />
          </FieldRow>
          <FieldRow label="Action" htmlFor="action-select">
            <select
              id="action-select"
              value={value.actionType}
              onChange={e => setValue(v => ({ ...v, actionType: e.target.value as typeof v.actionType }))}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 dark:border-gray-600 dark:bg-gray-700"
            >
              <option value="launch-app">Launch Application</option>
              <option value="run-command">Run Command</option>
              <option value="execute-script">Execute Script</option>
            </select>
          </FieldRow>
          <FieldRow label="Target" htmlFor="target-input">
            <TargetPicker
              actionType={value.actionType}
              value={value.target}
              onChange={onUpdateTarget}
              isModalOpen={isOpen}
            />
          </FieldRow>
          <FieldRow label="Comment" htmlFor="comment-input">
            <input
              id="comment-input"
              type="text"
              value={value.comment}
              onChange={e => setValue(v => ({ ...v, comment: e.target.value }))}
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
              {props.cancelText || 'Cancel'}
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Loading...' : props.confirmText || 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
