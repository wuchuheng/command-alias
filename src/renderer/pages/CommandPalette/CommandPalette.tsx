import React, { useState, useEffect, useRef } from 'react';
import { CommandAlias } from '@/main/database/entities/CommandAlias';

/**
 * CommandPalette renders the Notice UI overlay that lists key bindings and filters them in real-time
 * as the user types. It displays columns: alias, Target path/command, Type, and Comment.
 */
export default function CommandPalette() {
  const [bindings, setBindings] = useState<CommandAlias[]>([]);
  const [filter, setFilter] = useState('');

  /**
   * Normalize a key alias by removing spaces and lowering case for comparisons.
   * @param value - Raw user input or stored alias (e.g., "c o d e")
   * @returns Normalized string (e.g., "code")
   */
  const normalizealias = (value: string): string => value.replace(/\s+/g, '').toLowerCase();

  /**
   * Convert an action type to a concise label.
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

  const loadBindings = async () => {
    // 1. Input handling: none (no params)
    try {
      const data: CommandAlias[] = await window.electron.commandAlias.getAlias();
      setBindings(data);
    } catch (error) {
      console.error('Failed to load bindings', error);
    }
    // 3. Output handling: state updated -> UI renders
  };

  useEffect(() => {
    // 2. Core processing: load all bindings when overlay mounts
    loadBindings();
    const cancel = window.electron.commandAlias.subscribeToAlias((newBindings: CommandAlias[]) => {
      setBindings(newBindings);
    });

    return () => {
      cancel();
    };
  }, []);

  const normalizedFilter = normalizealias(filter);
  const filteredBindings = bindings.filter(b => normalizealias(b.alias).startsWith(normalizedFilter));

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Input handling: capture the latest text
    const newValue = e.target.value;
    setFilter(newValue);

    // 2. Core processing: check if any binding matches exactly (prefix fully typed)
    const matchedHotkey = bindings.find(item => normalizealias(item.alias) === normalizealias(newValue));
    if (!matchedHotkey) return;

    // 3. Output handling: execute and close overlay
    await window.electron.commandAlias.hideCommandPalette();
    setFilter('');
    await window.electron.commandAlias.toggleApp(matchedHotkey.id);
  };

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        window.electron.commandAlias.hideCommandPalette();
        setFilter('');
        return;
      }

      // If the input is not focused, then make it and focus
      if (document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
      }
    };
    // Listen any key input.
    globalThis.addEventListener('keydown', handleKeyDown);

    return () => {
      globalThis.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputRef]);

  const borderRadius = '12px';
  return (
    <div
      className="w-full max-w-3xl overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
      style={{
        borderRadius: borderRadius,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="CommandAlias Command Palette"
    >
      <input
        type="text"
        ref={inputRef}
        style={{
          borderTopLeftRadius: borderRadius,
          borderTopRightRadius: borderRadius,
        }}
        className="w-full rounded-t-lg border-b border-gray-200 p-4 text-gray-900 placeholder-gray-400 outline-none dark:border-gray-700 dark:text-gray-100"
        placeholder="Type a shortcut alias (e.g., c o d e). Press Esc to close"
        value={filter}
        onChange={onChange}
        autoFocus
      />

      <div className="max-h-[60vh] w-full overflow-y-auto">
        {/* Header row */}
        <div className="grid grid-cols-12 gap-4 border-b border-gray-200 px-4 py-2 text-xs font-semibold uppercase text-gray-500 dark:border-gray-700 dark:text-gray-400">
          <div className="col-span-3">Shortcuts</div>
          <div className="col-span-5">Target</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Comment</div>
        </div>

        {filteredBindings.length === 0 ? (
          <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">No matching commands.</div>
        ) : (
          filteredBindings.map(binding => (
            <div
              key={binding.id}
              className="grid grid-cols-12 items-center gap-4 border-b border-gray-100 px-4 py-3 text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/60"
            >
              <span className="col-span-3 font-mono text-gray-900 dark:text-gray-100">
                <ShortcutRender value={binding.alias} currentInputChar={filter} />
              </span>
              <span className="col-span-5 truncate text-gray-700 dark:text-gray-300" title={binding.target}>
                {binding.target}
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
    </div>
  );
}

type KeyCapProps = {
  label: string;
  isActive?: boolean;
};

/**
 * Renders a compact keycap, styled to resemble a keyboard key.
 */
const KeyCap: React.FC<KeyCapProps> = ({ label, isActive }) => {
  // 3. Output handling: present a styled key label
  return (
    <span
      className={[
        // Base keycap visuals
        'inline-flex min-w-[1rem] items-center justify-center rounded px-1 font-mono text-xs leading-5 shadow-sm transition-colors',
        // Variant: dim already-typed (active) keys to emphasize remaining keys
        isActive
          ? 'border border-gray-300 bg-gray-50 text-gray-400 opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500'
          : 'border border-gray-300 bg-gray-100 text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
      ].join(' ')}
      aria-disabled={isActive}
      title={isActive ? 'Already typed' : 'Pending'}
    >
      {label}
    </span>
  );
};

type ShortcutsProps = {
  value: string;
  currentInputChar: string;
};

/**
 * ShortcutRender displays a alias like "c o d e" as individual keycaps per letter.
 */
const ShortcutRender: React.FC<ShortcutsProps> = ({ value, currentInputChar }) => {
  // 1. Input handling: split into characters and ignore spaces
  const chars = Array.from(value).filter(ch => ch.trim().length > 0);

  // 2. Core processing: normalize labels for presentation (uppercase)
  const labels = chars.map(ch => ch.toUpperCase());

  return (
    <div className="flex items-center gap-1.5">
      {labels.map((label, idx) => (
        <KeyCap key={`${label}-${idx}`} label={label} isActive={currentInputChar.length > idx} />
      ))}
    </div>
  );
};
