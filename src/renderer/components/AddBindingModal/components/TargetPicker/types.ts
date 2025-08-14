/** Action types supported by TargetPicker. */
export type ActionType = 'launch-app' | 'run-command' | 'execute-script';

/** Installed application descriptor retrieved from main process. */
export interface InstalledApp {
  id: string;
  name: string;
  path: string;
  iconDataUrl?: string;
}

/** Props shared by subcomponents needing launch-mode awareness. */
export interface LaunchModeProps {
  isLaunch: boolean;
}
