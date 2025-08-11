import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// English translations
const enTranslations = {
  home: {
    title: 'Welcome to electron-app-name!',
    successMessage: 'Application running successfully!',
    description:
      'Your desktop application is now ready! Built with Electron, React, and Tailwind CSS for optimal performance.',
    database: {
      title: 'Database Status',
      connected: 'SQLite3 Database Connected',
      description: 'Embedded SQLite3 database is running smoothly and ready to store your data securely.',
      messageCount: 'Messages in Database',
      noMessages: 'No messages found in database',
      hasMessages: 'messages stored successfully',
    },
    features: {
      title: 'Key Features',
      offline: {
        title: 'Offline Ready',
        description: 'Works completely offline with embedded SQLite3 database',
      },
      secure: {
        title: 'Secure Storage',
        description: 'Your data is stored locally and securely on your device',
      },
      fast: {
        title: 'Lightning Fast',
        description: 'Optimized performance with modern web technologies',
      },
      routing: {
        title: 'React Router',
        description: 'Modern client-side routing with React Router for seamless navigation',
      },
    },
    gettingStarted: {
      title: 'Getting Started',
      description: 'Explore the features and functionality available in the application.',
    },
    needHelp: {
      title: 'Need Help?',
      description: 'Check out our documentation or contact support for assistance.',
    },
  },
  about: {
    title: 'About electron-app-name',
    subtitle: 'Desktop Application Information',
    version: {
      title: 'Version Information',
      current: 'Current Version',
      author: 'Author',
      license: 'License',
      description: 'Description',
    },
    technology: {
      title: 'Technology Stack',
      frontend: 'Frontend Technologies',
      backend: 'Backend Technologies',
      tools: 'Development Tools',
    },
    features: {
      title: 'Key Features',
      crossPlatform: {
        title: 'Cross Platform',
        description: 'Runs on Windows, macOS, and Linux',
      },
      modernUI: {
        title: 'Modern UI',
        description: 'Built with React and Tailwind CSS for a responsive design',
      },
      database: {
        title: 'Local Database',
        description: 'Embedded SQLite database for offline data storage',
      },
      i18n: {
        title: 'Internationalization',
        description: 'Multi-language support with i18next',
      },
    },
    contact: {
      title: 'Contact Information',
      email: 'Email',
      github: 'GitHub Repository',
      support: 'Support',
    },
    navigation: {
      backToHome: 'Back to Home',
    },
  },
};

// Chinese translations
const zhTranslations = {
  home: {
    title: '欢迎使用 electron-app-name！',
    successMessage: '应用程序运行成功！',
    description: '您的桌面应用程序已准备就绪！使用 Electron、React 和 Tailwind CSS 构建，性能卓越。',
    database: {
      title: '数据库状态',
      connected: 'SQLite3 数据库已连接',
      description: '嵌入式 SQLite3 数据库运行顺畅，随时准备安全存储您的数据。',
      messageCount: '数据库中的消息',
      noMessages: '数据库中未找到消息',
      hasMessages: '条消息已成功存储',
    },
    features: {
      title: '主要功能',
      offline: {
        title: '离线就绪',
        description: '使用嵌入式 SQLite3 数据库完全离线工作',
      },
      secure: {
        title: '安全存储',
        description: '您的数据在设备上本地安全存储',
      },
      fast: {
        title: '闪电般快速',
        description: '使用现代网络技术优化性能',
      },
      routing: {
        title: 'React Router',
        description: '使用 React Router 实现现代客户端路由，提供无缝导航体验',
      },
    },
    gettingStarted: {
      title: '开始使用',
      description: '探索应用程序中可用的功能和特性。',
    },
    needHelp: {
      title: '需要帮助？',
      description: '查看我们的文档或联系支持以获得帮助。',
    },
  },
  about: {
    title: '关于 electron-app-name',
    subtitle: '桌面应用程序信息',
    version: {
      title: '版本信息',
      current: '当前版本',
      author: '作者',
      license: '许可证',
      description: '描述',
    },
    technology: {
      title: '技术栈',
      frontend: '前端技术',
      backend: '后端技术',
      tools: '开发工具',
    },
    features: {
      title: '主要功能',
      crossPlatform: {
        title: '跨平台',
        description: '支持 Windows、macOS 和 Linux',
      },
      modernUI: {
        title: '现代化界面',
        description: '使用 React 和 Tailwind CSS 构建响应式设计',
      },
      database: {
        title: '本地数据库',
        description: '嵌入式 SQLite 数据库用于离线数据存储',
      },
      i18n: {
        title: '国际化',
        description: '使用 i18next 提供多语言支持',
      },
    },
    contact: {
      title: '联系信息',
      email: '邮箱',
      github: 'GitHub 仓库',
      support: '技术支持',
    },
    navigation: {
      backToHome: '返回首页',
    },
  },
};

// Initialize i18n
i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: {
      en: { translation: enTranslations },
      zh: { translation: zhTranslations },
    },
    fallbackLng: 'zh',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
  });

export default i18n;
