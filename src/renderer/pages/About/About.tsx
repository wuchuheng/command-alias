import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import packageJson from '../../../../package.json';

export const About: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const goToHome = () => {
    navigate('/');
  };

  return (
    <div className="flex h-full flex-col items-center justify-start overflow-y-auto p-6">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header Section */}
        <div className="rounded-lg bg-background-secondary p-6 text-center shadow-lg">
          <h1 className="mb-2 text-3xl font-bold text-primary-600 dark:text-primary-400">{t('about.title')}</h1>
          <p className="text-text-secondary">{t('about.subtitle')}</p>
        </div>

        {/* Version Information Section */}
        <div className="rounded-lg bg-background-secondary p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-primary-600 dark:text-primary-400">{t('about.version.title')}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <span className="font-medium text-text-primary">{t('about.version.current')}:</span>
                <span className="rounded bg-primary-100 px-2 py-1 text-sm font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                  v{packageJson.version}
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <span className="font-medium text-text-primary">{t('about.version.author')}:</span>
                <span className="text-text-secondary">{packageJson.author.name}</span>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <span className="font-medium text-text-primary">{t('about.version.license')}:</span>
                <span className="text-text-secondary">{packageJson.license}</span>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <span className="font-medium text-text-primary">{t('about.version.description')}:</span>
                <span className="text-text-secondary">{packageJson.description}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Stack Section */}
        <div className="rounded-lg bg-background-secondary p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-primary-600 dark:text-primary-400">
            {t('about.technology.title')}
          </h2>

          <div className="space-y-4">
            {/* Frontend Technologies */}
            <div>
              <h3 className="mb-2 font-semibold text-text-primary">{t('about.technology.frontend')}</h3>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  React {packageJson.dependencies.react.replace('^', '')}
                </span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  TypeScript {packageJson.devDependencies.typescript.replace('^', '')}
                </span>
                <span className="rounded-full bg-cyan-100 px-3 py-1 text-sm font-medium text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
                  Tailwind CSS {packageJson.devDependencies.tailwindcss.replace('^', '')}
                </span>
                <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Ant Design {packageJson.dependencies.antd.replace('^', '')}
                </span>
              </div>
            </div>

            {/* Backend Technologies */}
            <div>
              <h3 className="mb-2 font-semibold text-text-primary">{t('about.technology.backend')}</h3>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                  Electron {packageJson.devDependencies.electron.replace('^', '')}
                </span>
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  SQLite3 {packageJson.dependencies['better-sqlite3'].replace('^', '')}
                </span>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  TypeORM {packageJson.dependencies.typeorm.replace('^', '')}
                </span>
              </div>
            </div>

            {/* Development Tools */}
            <div>
              <h3 className="mb-2 font-semibold text-text-primary">{t('about.technology.tools')}</h3>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  Webpack
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  ESLint
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  Prettier
                </span>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  i18next {packageJson.dependencies.i18next.replace('^', '')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features Section */}
        <div className="rounded-lg bg-background-secondary p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-primary-600 dark:text-primary-400">{t('about.features.title')}</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 flex items-center">
                <svg
                  className="mr-2 h-5 w-5 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <h3 className="font-semibold text-text-primary">{t('about.features.crossPlatform.title')}</h3>
              </div>
              <p className="text-sm text-text-secondary">{t('about.features.crossPlatform.description')}</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 flex items-center">
                <svg
                  className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                  ></path>
                </svg>
                <h3 className="font-semibold text-text-primary">{t('about.features.modernUI.title')}</h3>
              </div>
              <p className="text-sm text-text-secondary">{t('about.features.modernUI.description')}</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 flex items-center">
                <svg
                  className="mr-2 h-5 w-5 text-yellow-600 dark:text-yellow-400"
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
                <h3 className="font-semibold text-text-primary">{t('about.features.database.title')}</h3>
              </div>
              <p className="text-sm text-text-secondary">{t('about.features.database.description')}</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 flex items-center">
                <svg
                  className="mr-2 h-5 w-5 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  ></path>
                </svg>
                <h3 className="font-semibold text-text-primary">{t('about.features.i18n.title')}</h3>
              </div>
              <p className="text-sm text-text-secondary">{t('about.features.i18n.description')}</p>
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="rounded-lg bg-background-secondary p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-primary-600 dark:text-primary-400">{t('about.contact.title')}</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 flex justify-center">
                <svg
                  className="h-6 w-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <h3 className="mb-1 font-semibold text-text-primary">{t('about.contact.email')}</h3>
              <p className="text-sm text-text-secondary">{packageJson.author.email}</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 flex justify-center">
                <svg className="h-6 w-6 text-gray-800 dark:text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
              <h3 className="mb-1 font-semibold text-text-primary">{t('about.contact.github')}</h3>
              <p className="text-sm text-text-secondary">GitHub</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 flex justify-center">
                <svg
                  className="h-6 w-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="mb-1 font-semibold text-text-primary">{t('about.contact.support')}</h3>
              <p className="text-sm text-text-secondary">Community Support</p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="rounded-lg bg-background-secondary p-6 shadow-lg">
          <div className="flex justify-center">
            <button
              onClick={goToHome}
              className="flex items-center rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                ></path>
              </svg>
              {t('about.navigation.backToHome')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
