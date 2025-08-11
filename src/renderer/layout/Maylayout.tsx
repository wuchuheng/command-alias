import React, { useCallback, useEffect } from 'react';
import TitleBar from './TitleBar';
import { ConfigProvider, theme } from 'antd';
import { useTranslation } from 'react-i18next';
import { Bootloading } from './Bootloading';

type MainLayoutProps = {
  children: React.ReactNode;
};
export const MainLayout: React.FC<MainLayoutProps> = props => {
  const [isDarkTheme, setIsDarkTheme] = React.useState<boolean>(false);

  // Initialize theme on component mount - default to light theme
  React.useEffect(() => {
    // Remove any existing dark class to ensure light theme is default
    document.documentElement.classList.remove('dark');
    setIsDarkTheme(false);
    console.log('Initialize theme on component mount - default to light theme');
  }, []);

  const onToggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkTheme(isDark);
  };

  const { i18n } = useTranslation();

  const onToggleLanguage = useCallback(() => {
    const newLang = i18n.language.startsWith('en') ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
  }, [i18n]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
        algorithm: isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <div className="h-[100vh] bg-background-primary flex flex-col">
        <TitleBar isDarkTheme={isDarkTheme} onToggleTheme={onToggleTheme} onToggleLanguage={onToggleLanguage} />
        <main className="flex-1 overflow-y-auto">
          <Bootloading>{props.children}</Bootloading>
        </main>
      </div>
    </ConfigProvider>
  );
};
