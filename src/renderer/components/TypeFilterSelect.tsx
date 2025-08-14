import React from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';

/** Allowed type filter values for bindings list. */
export type BindingTypeFilter = 'all' | 'launch-app' | 'run-command' | 'execute-script';

type OptionDef = { value: BindingTypeFilter; label: string };

/** Internal static options definition (kept out of render for stability). */
const OPTIONS: OptionDef[] = [
  { value: 'all', label: 'All' },
  { value: 'launch-app', label: 'App' },
  { value: 'run-command', label: 'Cmd' },
  { value: 'execute-script', label: 'Script' },
];

export type TypeFilterSelectProps = {
  /** Current selected filter value. */
  value: BindingTypeFilter;
  /** Change handler invoked with the newly selected filter value. */
  onChange: (value: BindingTypeFilter) => void;
  /** Optional className passthrough for outer wrapper. */
  className?: string;
  /** Optional aria-label override (defaults to "Filter bindings by type"). */
  ariaLabel?: string;
};

/**
 * Compact select component that replaces the previous segmented button group
 * to save horizontal space while allowing users to filter bindings by type.
 */
export const TypeFilterSelect: React.FC<TypeFilterSelectProps> = ({
  value,
  onChange,
  className = '',
  ariaLabel = 'Filter bindings by type',
}) => {
  // 3. Output handling: render styled select with custom arrow + spacing
  return (
    <div className={`relative inline-flex ${className}`}>
      <span className="sr-only">{ariaLabel}</span>
      <select
        value={value}
        aria-label={ariaLabel}
        onChange={e => onChange(e.target.value as BindingTypeFilter)}
        className="h-9 min-w-[4.5rem] cursor-pointer appearance-none rounded-md border border-black/10 bg-white/80 pl-3 pr-8 text-sm text-gray-700 shadow-sm outline-none transition dark:border-white/10 dark:bg-gray-800/70 dark:text-gray-100"
      >
        {OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-400">
        <IoMdArrowDropdown className="h-4 w-4" />
      </span>
    </div>
  );
};
