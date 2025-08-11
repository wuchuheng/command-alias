import React from 'react';
import packageJson from '../../../package.json';
const Icons = {
  MoonIcon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 11.54 20.96 11.08 20.9 10.64C19.92 12.01 18.32 12.9 16.5 12.9C13.52 12.9 11.1 10.48 11.1 7.5C11.1 5.69 11.99 4.08 13.36 3.1C12.92 3.04 12.46 3 12 3Z"
        fill="currentColor"
      />
    </svg>
  ),
  SunIcon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM2 13H4C4.55 13 5 12.55 5 12C5 11.45 4.55 11 4 11H2C1.45 11 1 11.45 1 12C1 12.55 1.45 13 2 13ZM20 13H22C22.55 13 23 12.55 23 12C23 11.45 22.55 11 22 11H20C19.45 11 19 11.45 19 12C19 12.55 19.45 13 20 13ZM11 2V4C11 4.55 11.45 5 12 5C12.55 5 13 4.55 13 4V2C13 1.45 12.55 1 12 1C11.45 1 11 1.45 11 2ZM11 20V22C11 22.55 11.45 23 12 23C12.55 23 13 22.55 13 22V20C13 19.45 12.55 19 12 19C11.45 19 11 19.45 11 20ZM5.99 4.58C5.6 4.19 4.96 4.19 4.58 4.58C4.19 4.97 4.19 5.61 4.58 5.99L5.64 7.05C6.03 7.44 6.67 7.44 7.05 7.05C7.44 6.66 7.44 6.02 7.05 5.64L5.99 4.58ZM18.36 16.95C17.97 16.56 17.33 16.56 16.95 16.95C16.56 17.34 16.56 17.98 16.95 18.36L18.01 19.42C18.4 19.81 19.04 19.81 19.42 19.42C19.81 19.03 19.81 18.39 19.42 18.01L18.36 16.95ZM19.42 5.99C19.81 5.6 19.81 4.96 19.42 4.58C19.03 4.19 18.39 4.19 18.01 4.58L16.95 5.64C16.56 6.03 16.56 6.67 16.95 7.05C17.34 7.44 17.98 7.44 18.36 7.05L19.42 5.99ZM7.05 18.36C7.44 17.97 7.44 17.33 7.05 16.95C6.66 16.56 6.02 16.56 5.64 16.95L4.58 18.01C4.19 18.4 4.19 19.04 4.58 19.42C4.97 19.81 5.61 19.81 5.99 19.42L7.05 18.36Z"
        fill="currentColor"
      />
    </svg>
  ),
  CloseIcon: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  // Make the windows bigger.
  MaxIcon: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    </svg>
  ),
  // Make the windows smaller.
  MinIcon: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  LanguageIcon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.87 15.07L10.33 12.56L10.36 12.53C12.1 10.59 13.34 8.36 14.07 6H17V4H10V2H8V4H1V6H12.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8H4.69C5.42 9.63 6.42 11.17 7.67 12.56L2.58 17.58L4 19L9 14L12.11 17.11L12.87 15.07ZM18.5 10H16.5L12 22H14L15.12 19H19.87L21 22H23L18.5 10ZM15.88 17L17.5 12.67L19.12 17H15.88Z"
        fill="currentColor"
      />
    </svg>
  ),
};

const ThemeIcon = ({ isDark }: { isDark: boolean }) => (isDark ? Icons.MoonIcon : Icons.SunIcon);

// Interface for title bar props
interface TitleBarProps {
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
}

const TitleBar: React.FC<TitleBarProps> = ({ isDarkTheme, onToggleTheme, onToggleLanguage }) => {
  // Window control functions
  const handleMinimize = () => {
    window.electron.window.minimize();
  };

  const handleMaximize = () => {
    window.electron.window.maximize();
  };

  const handleClose = () => {
    window.electron.window.close();
  };

  return (
    <div className="titlebar flex items-center justify-between px-2 py-2 h-titlebar select-none drag  text-text-primary">
      {/* App Title - Left side */}
      <div className="flex items-center space-x-3 no-drag">
        <span className="text-sm font-medium opacity-80 ">{packageJson.productName}</span>
      </div>

      {/* Controls - Right side */}
      <div className="flex items-center space-x-1 no-drag">
        {/* Language switcher */}
        <button
          onClick={onToggleLanguage}
          className="titlebar-button p-2 rounded-md hover:bg-hover hover:text-text-primary transition-all duration-200"
          aria-label="Switch Language"
        >
          {Icons.LanguageIcon}
        </button>

        {/* Theme toggle */}
        <button
          onClick={e => {
            e.stopPropagation();
            onToggleTheme();
          }}
          className="titlebar-button p-2 rounded-md hover:bg-hover hover:text-text-primary transition-all duration-200"
          aria-label="Toggle Theme"
        >
          <ThemeIcon isDark={isDarkTheme} />
        </button>

        {/* Window controls */}
        <button
          onClick={handleMinimize}
          className="titlebar-button p-2 rounded-md hover:bg-hover hover:text-text-primary transition-all duration-200"
          aria-label="Minimize"
        >
          <span className="text-text-secondary">{Icons.MinIcon}</span>
        </button>

        <button
          onClick={handleMaximize}
          className="itlebar-button p-2 rounded-md hover:bg-hover hover:text-text-primary transition-all duration-200"
          aria-label="Maximize"
        >
          <span className="text-text-secondary">{Icons.MaxIcon}</span>
        </button>

        <button
          onClick={handleClose}
          className="titlebar-button close p-2 rounded-md hover:bg-close-hover hover:text-close-hover-text transition-all duration-200"
          aria-label="Close"
        >
          <span className="text-text-secondary hover:text-white">{Icons.CloseIcon}</span>
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
