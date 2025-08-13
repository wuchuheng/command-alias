import { useEffect, useMemo, useState } from 'react';
import type { CommandAlias } from '../../main/database/entities/CommandAlias';

interface AddBindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (binding: Omit<CommandAlias, 'id'>) => Promise<void>;
}

export const AddBindingModal = ({ isOpen, onClose, onAdd }: AddBindingModalProps) => {
  const [sequence, setSequence] = useState('');
  const [actionType, setActionType] = useState<'launch-app' | 'run-command' | 'execute-script'>('launch-app');
  const [target, setTarget] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Installed apps (Windows) support
  type InstalledApp = { id: string; name: string; path: string; iconDataUrl?: string };
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState<string | null>(null);
  const [appSearch, setAppSearch] = useState('');

  const loadApps = async (force = false) => {
    if (actionType !== 'launch-app') return;
    setAppsLoading(true);
    setAppsError(null);
    try {
      const data = force
        ? await window.electron.apps.refreshInstalledApps()
        : await window.electron.apps.getInstalledApps();
      setApps(data);
    } catch (e) {
      setAppsError(e instanceof Error ? e.message : 'Failed to load apps');
    } finally {
      setAppsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && actionType === 'launch-app') {
      void loadApps(false);
    }
  }, [isOpen, actionType]);

  const filteredApps = useMemo(() => {
    const q = appSearch.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter(a => a.name.toLowerCase().includes(q));
  }, [apps, appSearch]);

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
              onChange={e => setActionType(e.target.value as typeof actionType)}
              className="w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700"
            >
              <option value="launch-app">Launch Application</option>
              <option value="run-command">Run Command</option>
              <option value="execute-script">Execute Script</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="mb-2 block font-medium">Target</label>
            {actionType === 'launch-app' && (
              <div className="mb-2">
                <div className="mb-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={appSearch}
                    onChange={e => setAppSearch(e.target.value)}
                    placeholder="Search installed apps"
                    className="w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => loadApps(true)}
                    className="whitespace-nowrap rounded border px-3 py-2 text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                    disabled={appsLoading}
                    title="Refresh"
                  >
                    {appsLoading ? 'Loading…' : 'Refresh'}
                  </button>
                </div>
                {appsError && (
                  <div className="mb-2 rounded bg-red-100 p-2 text-sm text-red-800 dark:bg-red-900 dark:text-red-100">
                    {appsError}
                  </div>
                )}
                <div className="max-h-48 overflow-auto rounded border dark:border-gray-600">
                  {appsLoading && apps.length === 0 ? (
                    <div className="p-2 text-sm opacity-70">Loading installed apps…</div>
                  ) : filteredApps.length === 0 ? (
                    <div className="p-2 text-sm opacity-70">No apps found</div>
                  ) : (
                    <ul>
                      {filteredApps.map(appItem => (
                        <li
                          key={appItem.id}
                          className="flex cursor-pointer items-center gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setTarget(appItem.path)}
                          title={appItem.path}
                        >
                          {appItem.iconDataUrl ? (
                            <img src={appItem.iconDataUrl} alt="" className="h-4 w-4" />
                          ) : (
                            <div className="flex h-4 w-4 items-center justify-center rounded bg-gray-300 text-[10px] text-gray-700 dark:bg-gray-600 dark:text-gray-100">
                              {appItem.name.slice(0, 1)}
                            </div>
                          )}
                          <span className="truncate text-sm">{appItem.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={target}
                onChange={e => setTarget(e.target.value)}
                className="w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700"
                placeholder={
                  actionType === 'launch-app' ? 'Executable path (auto-filled when you pick an app)' : 'Path or command'
                }
                required
              />
              {actionType === 'launch-app' && (
                <button
                  type="button"
                  className="rounded border px-3 py-2 text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                  onClick={async () => {
                    const p = await window.electron.apps.browseForExecutable();
                    if (p) setTarget(p);
                  }}
                >
                  Browse…
                </button>
              )}
            </div>
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
