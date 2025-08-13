import { ConfigProvider, theme } from 'antd';
import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { RouteRender } from './config/Route';
import './styles/global.css';
import './i18n/i18n';
import { MainLayout } from './layout/Maylayout';
import CommandPalette from './pages/CommandPalette/CommandPalette';

// Wait for DOM to be ready before mounting React
document.addEventListener('DOMContentLoaded', () => {
  const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);

  const queryParams = new URLSearchParams(window.location.search);
  const windowType = queryParams.get('windowType');

  root.render(
    <React.StrictMode>
      {windowType === 'command-palette' ? (
        <CommandPalette />
      ) : (
        <MainLayout>
          <RouteRender />
        </MainLayout>
      )}
    </React.StrictMode>
  );
});
