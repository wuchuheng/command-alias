import { useEffect, useState } from 'react';
import logoSvg from '../../assets/logo.svg';
import type { CommandAlias } from '../../../main/database/entities/CommandAlias';
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
const getTypeLabel = (type: CommandAlias['actionType']): string => {
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
  const [bindings, setBindings] = useState<CommandAlias[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'launch-app' | 'run-command' | 'execute-script'>('all');

  const loadBindings = async () => {
    try {
      const data = await window.electron.commandAlias.getAlias();
      setBindings(data);
    } catch (error) {
      console.error('Binding load failed', error);
    }
  };

  useEffect(() => {
    loadBindings();
  }, []);

  const handleAddBinding = async (binding: Omit<CommandAlias, 'id'>) => {
    try {
      await window.electron.commandAlias.addAlias(binding);
      await loadBindings();
    } catch (error) {
      console.error('Failed to add binding', error);
      throw error;
    }
  };

  // 2. Core processing: compute filtered list using text and type filters
  const filteredBindings = (() => {
    const q = filterText.trim().toLowerCase();
    return bindings.filter(b => {
      if (typeFilter !== 'all' && b.actionType !== typeFilter) return false;
      if (!q) return true;
      const hay = `${b.sequence} ${b.target ?? ''} ${b.comment ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  })();

  return (
    <>
      <AddBindingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddBinding} />
      <div className="mx-auto max-w-4xl p-4">
        {/* Top toolbar: macOS-style header with controls on the right */}
        <div className="mb-4 flex items-center justify-between gap-3 bg-white/60 px-3 py-2 backdrop-blur-sm dark:border-white/5 dark:bg-gray-900/60">
          <h1 className="flex items-center gap-3 text-xl font-semibold">
            <img src={logoSvg} alt="Command Alias logo" className="h-7 w-7" />
            <span>Command Alias</span>
          </h1>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              placeholder="Search"
              className="h-9 w-72 rounded-full border border-black/10 bg-white/80 px-3.5 text-sm placeholder-gray-400 outline-none focus:border-[#0A84FF] focus:ring-2 focus:ring-[#0A84FF]/30 dark:border-white/10 dark:bg-gray-800/70 dark:text-gray-100 dark:placeholder-gray-500"
            />
            <div className="inline-flex items-center rounded-full border border-black/10 bg-white/70 p-0.5 dark:border-white/10 dark:bg-gray-800/70">
              {(
                [
                  { k: 'all', label: 'All' },
                  { k: 'launch-app', label: 'App' },
                  { k: 'run-command', label: 'Cmd' },
                  { k: 'execute-script', label: 'Script' },
                ] as const
              ).map(seg => (
                <button
                  key={seg.k}
                  type="button"
                  onClick={() => setTypeFilter(seg.k)}
                  aria-pressed={typeFilter === seg.k}
                  className={[
                    'relative rounded-full px-3 py-1.5 text-sm transition-colors focus:outline-none',
                    typeFilter === seg.k
                      ? 'bg-[#0A84FF] text-white shadow-sm'
                      : 'text-gray-700 hover:bg-black/5 dark:text-gray-200 dark:hover:bg-white/10',
                  ].join(' ')}
                >
                  {seg.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="h-9 rounded-full bg-[#0A84FF] px-4 text-sm font-semibold text-white shadow hover:bg-[#0a7af0] focus:outline-none focus:ring-2 focus:ring-[#0A84FF]/30"
            >
              Add
            </button>
          </div>
        </div>

        {/* CommandPalette-style list */}
        <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-4 border-b border-gray-200 px-4 py-2 text-xs font-semibold uppercase text-gray-500 dark:border-gray-700 dark:text-gray-400">
            <div className="col-span-3">Alias</div>
            <div className="col-span-5">Target</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Comment</div>
          </div>

          {/* Rows */}
          {filteredBindings.length === 0 ? (
            <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">No bindings found.</div>
          ) : (
            filteredBindings.map(binding => (
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
                <span className="col-span-2 inline-flex w-fit items-center justify-center rounded-full bg-blue-50 px-2 py-0.5 text-center text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                  {getTypeLabel(binding.actionType)}
                </span>
                <span className="col-span-2 truncate text-gray-600 dark:text-gray-400" title={binding.comment || ''}>
                  {binding.comment || '-'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
