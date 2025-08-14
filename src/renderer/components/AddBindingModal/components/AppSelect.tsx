import { useEffect, useState } from 'react';

export type InstalledApp = { id: string; name: string; path: string; iconDataUrl?: string };

export const AppSelect: React.FC<{
  value: string;
  onPick: (app: InstalledApp) => void;
  isOpen: boolean;
  actionType: 'launch-app' | 'run-command' | 'execute-script';
}> = ({ value, onPick, isOpen, actionType }) => {
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async (force = false) => {
    setLoading(true);
    setErr(null);
    try {
      const data = force
        ? await window.electron.apps.refreshInstalledApps()
        : await window.electron.apps.getInstalledApps();
      setApps(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load apps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && actionType === 'launch-app') void load(false);
  }, [isOpen, actionType]);

  const filtered = (() => {
    const q = search.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter(a => a.name.toLowerCase().includes(q));
  })();

  const selectedApp = value ? apps.find(a => a.path === value) : undefined;

  return (
    <div className="relative w-full text-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-2 py-1.5 text-left dark:border-gray-600 dark:bg-gray-700"
        onClick={() => setOpen(o => !o)}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selectedApp ? (
            selectedApp.iconDataUrl ? (
              <img src={selectedApp.iconDataUrl} alt="" className="h-4 w-4 shrink-0" />
            ) : (
              <div className="flex h-4 w-4 items-center justify-center rounded bg-gray-300 text-[10px] text-gray-700 dark:bg-gray-600 dark:text-gray-100">
                {selectedApp.name.slice(0, 1)}
              </div>
            )
          ) : (
            <div className="h-4 w-4" />
          )}
          <span className="truncate">{selectedApp ? selectedApp.name : loading ? 'Loading…' : 'Select app…'}</span>
        </span>
        <svg
          className="ml-2 h-3 w-3 text-gray-500"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 4.5 6 7.5 9 4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full min-w-[14rem] rounded-md border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-600 dark:bg-gray-800">
          <div className="mb-2 flex items-center gap-2">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search apps"
              className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-500 dark:bg-gray-700"
            />
            <button
              type="button"
              onClick={() => load(true)}
              title="Refresh"
              className="rounded border border-gray-300 bg-white p-1 hover:bg-gray-100 dark:border-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              {/* Refresh SVG */}
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9 9 0 0 0-8.66 6" />
                <path d="M3 4v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9 9 0 0 0 8.66-6" />
                <path d="M21 20v-5h-5" />
              </svg>
            </button>
          </div>
          {err && (
            <div className="mb-2 rounded bg-red-100 px-2 py-1 text-xs text-red-700 dark:bg-red-900 dark:text-red-200">
              {err}
            </div>
          )}
          <div className="max-h-48 overflow-auto rounded border border-gray-200 dark:border-gray-600">
            {loading && apps.length === 0 ? (
              <div className="p-2 text-xs opacity-70">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-2 text-xs opacity-70">No apps found</div>
            ) : (
              <ul>
                {filtered.map(app => (
                  <li
                    key={app.id}
                    className="flex cursor-pointer items-center gap-2 px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      onPick(app);
                      setOpen(false);
                    }}
                    title={app.path}
                  >
                    {app.iconDataUrl ? (
                      <img src={app.iconDataUrl} alt="" className="h-4 w-4" />
                    ) : (
                      <div className="flex h-4 w-4 items-center justify-center rounded bg-gray-300 text-[10px] text-gray-700 dark:bg-gray-600 dark:text-gray-100">
                        {app.name.slice(0, 1)}
                      </div>
                    )}
                    <span className="truncate">{app.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
