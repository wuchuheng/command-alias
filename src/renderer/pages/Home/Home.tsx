import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  useTranslation();
  const navigate = useNavigate();
  const goToAbout = () => {
    navigate('/about');
  };

  const [welcomeMessage, setWelcomeMessage] = useState<string>('');

  useEffect(() => {
    window.electron.welcome.getWelcome().then(res => {
      setWelcomeMessage(res.title);
    });
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-start overflow-y-auto p-6">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header Section */}
        <div className="rounded-lg bg-background-secondary p-6 text-center shadow-lg">
          <h1 className="mb-4 text-3xl font-bold text-primary-600">electron-app-name Desktop</h1>
          <p className="text-text-secondary">Electron + React + TypeScript Desktop Application</p>
        </div>

        {/* Database Status Section */}
        <div className="rounded-lg bg-background-secondary p-6 shadow-lg">
          <div className="mb-4 flex items-center">
            <svg
              className="mr-3 h-6 w-6 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
              ></path>
            </svg>
            <h2 className="text-xl font-bold text-primary-600 dark:text-primary-400">SQLite Database</h2>
          </div>

          <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/30">
            <div className="flex items-center">
              <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Connected</p>
            </div>
          </div>

          {/* Database Message Display */}
          {welcomeMessage && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/30">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Welcome Message:</p>
              <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">{welcomeMessage}</p>
            </div>
          )}
        </div>

        {/* Tech Stack Section */}
        <div className="rounded-lg bg-background-secondary p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-primary-600 dark:text-primary-400">Technology Stack</h2>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="text-center">
                <div className="mb-2 text-lg font-semibold text-blue-600 dark:text-blue-400">Electron</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Desktop Framework</div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="text-center">
                <div className="mb-2 text-lg font-semibold text-cyan-600 dark:text-cyan-400">React</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">UI Library</div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="text-center">
                <div className="mb-2 text-lg font-semibold text-blue-700 dark:text-blue-300">TypeScript</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Language</div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="text-center">
                <div className="mb-2 text-lg font-semibold text-green-600 dark:text-green-400">SQLite</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Database</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="rounded-lg bg-background-secondary p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-primary-600 dark:text-primary-400">Navigation</h2>
          
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-2 font-semibold text-primary-600 dark:text-primary-400">Current Page</h3>
              <p className="text-sm text-text-secondary">Home - Main application dashboard</p>
            </div>

            <div
              className="cursor-pointer rounded-lg border border-primary-200 bg-primary-50 p-4 transition-all hover:bg-primary-100 dark:border-primary-800 dark:bg-primary-900/20 dark:hover:bg-primary-900/30"
              onClick={() => goToAbout()}
            >
              <h3 className="mb-2 font-semibold text-primary-600 dark:text-primary-400">About Page</h3>
              <p className="text-sm text-text-secondary">Navigate to about page →</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
