import { CommandAlias } from '@/main/database/entities/CommandAlias';

type ShortcutsProps = {
  /** Space separated characters, e.g., "c o d e". */
  value: string;
};

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
    <span className="inline-flex min-w-[1rem] items-center justify-center rounded-md border border-gray-300 bg-gray-100 px-1 font-mono text-xs leading-5 text-gray-800 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
      {label}
    </span>
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
 * Displays a alias like "c o d e" as individual keycaps per letter.
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

type TableRenderProps = {
  filteredBindings: CommandAlias[];
};
export const TableRender: React.FC<TableRenderProps> = ({ filteredBindings }) => {
  return (
    <div className="mb-4 overflow-hidden rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
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
              <ShortcutRender value={binding.alias} />
            </span>
            <span className="col-span-5 truncate text-gray-700 dark:text-gray-300" title={binding.target || ''}>
              {binding.target || '-'}
            </span>
            <span className="col-span-2 inline-flex w-fit items-center justify-center rounded-md bg-blue-50 px-2 py-0.5 text-center text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
              {getTypeLabel(binding.actionType)}
            </span>
            <span className="col-span-2 truncate text-gray-600 dark:text-gray-400" title={binding.comment || ''}>
              {binding.comment || '-'}
            </span>
          </div>
        ))
      )}
    </div>
  );
};
