import { useEffect, useState } from 'react';
import type { KeyBinding } from '../../../main/database/entities/KeyBinding';
import { AddBindingModal } from '../../components/AddBindingModal';

type KeyCapProps = {
  /** Label to display inside the keycap. */
  label: string;
};

/**
 * Renders a compact keycap, styled similarly to CommandPalette key chips.
 */
const KeyCap = ({ label }: KeyCapProps) => {
  // 3. Output handling: present a styled key label
  return (
    <span className="inline-flex min-w-[1rem] items-center justify-center rounded border border-gray-300 bg-gray-100 px-1 font-mono text-xs leading-5 text-gray-800 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
      {label}
    </span>
  );
};

type ShortcutsProps = {
  /** Space separated characters, e.g., "c o d e". */
  value: string;
};

/**
 * Displays a sequence like "c o d e" as individual keycaps per letter.
 */
const ShortcutRender = ({ value }: ShortcutsProps) => {
  // 1. Input handling: split into characters and ignore spaces
  const chars = Array.from(value).filter(ch => ch.trim().length > 0);

  // 2. Core processing: normalize labels for presentation (uppercase)
  const labels = chars.map(ch => ch.toUpperCase());

  // 3. Output handling
  return (
    <div className="flex items-center gap-1.5">
      {labels.map((label, idx) => (
        <KeyCap key={`${label}-${idx}`} label={label} />
      ))}
    </div>
  );
};

/**
 * Convert an action type to a concise label used in the UI badge.
 */
const getTypeLabel = (type: KeyBinding['actionType']): string => {
  switch (type) {
    case 'launch-app':
      return 'App';
    case 'run-command':
      return 'Cmd';
    case 'execute-script':
      return 'Script';
    default:
      return String(type);
  }
};

/**
 * Home shows all key bindings in a CommandPalette-like list for quick scanning.
 */
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

        {/* CommandPalette-style list */}
        <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-4 border-b border-gray-200 px-4 py-2 text-xs font-semibold uppercase text-gray-500 dark:border-gray-700 dark:text-gray-400">
            <div className="col-span-3">Shortcuts</div>
            <div className="col-span-5">Target</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Comment</div>
          </div>

          {/* Rows */}
          {bindings.length === 0 ? (
            <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">No bindings added yet.</div>
          ) : (
            bindings.map(binding => (
              <div
                key={binding.id}
                className="grid grid-cols-12 items-center gap-4 border-b border-gray-100 px-4 py-3 text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/60"
              >
                <span className="col-span-3 font-mono text-gray-900 dark:text-gray-100">
                  <ShortcutRender value={binding.sequence} />
                </span>
                <span className="col-span-5 truncate text-gray-700 dark:text-gray-300" title={binding.target || ''}>
                  {binding.target || '-'}
                </span>
                <span className="col-span-2 rounded bg-gray-100 px-2 py-0.5 text-center text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  {getTypeLabel(binding.actionType)}
                </span>
                <span className="col-span-2 truncate text-gray-600 dark:text-gray-400" title={binding.comment || ''}>
                  {binding.comment || '-'}
                </span>
              </div>
            ))
          )}
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
