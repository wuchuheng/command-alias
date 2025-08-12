# SpaceTrigger Software Design Document

## 1. Introduction

SpaceTrigger is a cross-platform keyboard shortcut launcher application inspired by SpaceTrigger for macOS. The application allows users to configure custom keyboard sequences to rapidly launch applications, execute commands, and streamline workflows.

### Core Features

- **Key Sequence Binding**: Map custom keyboard sequences to applications or commands
- **Cross-Platform Support**: Windows, macOS, and Linux compatibility
- **Real-Time Feedback**: Visual indication during key sequence entry
- **Configuration Management**: Centralized dashboard for all key bindings
- **Performance Optimization**: Low-latency execution of bound commands

### User Interaction Workflow

1. **Trigger**: User presses the configurable prefix key (default: `Space`)
2. **Input**: User enters the bound key sequence
3. **Visual Feedback**: Dialog UI shows matching commands in real-time
4. **Execution**: System launches the selected application or executes command

### UI Components

- **Dashboard UI**: Primary configuration interface with:
  - Key binding management table
  - Application path configuration
  - Prefix key customization
  - Activation delay settings
  - Binding comments/descriptions
- **Dialog UI**: Minimalist overlay that appears during key sequence entry:
  - Shows matching commands as user types
  - Provides visual feedback for partial matches
  - Auto-completes commands when unique match exists

### Key Binding Configuration

Bindings consist of three core elements:

1. **Prefix Key**: Configurable activation key (default: Space)
2. **Command Sequence**: Unique key combination that triggers action
3. **Target Action**: Either:
   - Application launch with specified path
   - System command execution
   - Custom script execution

Example binding:

```yaml
- prefix: Space
  sequence: "c o d e"
  action:
    type: "launch-app"
    path: "C:\Program Files\Microsoft VS Code\Code.exe"
  comment: "Launch Visual Studio Code"
```

### Dashboard Configuration Options

- **Prefix Key**: Set the activation key (e.g., Space, Ctrl+Space)

### Activation Delay Behavior

- **Default Value**: 500ms
- **Trigger**: User holds the Space key (fixed prefix key) for the configured delay time
- **UI Response**:
  - Dialog UI appears centered on screen
  - Displays all available commands in format:
    ```
    [Sequence] [Application Path] [Type] [Comments]
    ```
  - Example display:
    ```
    c o d e   C:\Program Files\Microsoft VS Code\Code.exe   launch-app   Launch Visual Studio Code
    a         C:\Program Files\Android Studio\studio.exe    launch-app   Launch Android Studio
    ```
- **Real-time Filtering**:
  - As user types additional keys after Space, the list dynamically filters
  - Only shows commands starting with the typed sequence
  - Example:
    - `Space` + `c` → shows only commands starting with 'c'
    - `Space` + `c` + `o` → shows only commands starting with 'co'
- **UI Theme**: Light/dark mode selection
- **Dialog Position**: Configure where dialog appears on screen
- **Key Binding Import/Export**: Manage configurations via JSON files

## 2. System Architecture

### 2.1 High-Level Overview

```
┌──────────────────────┐       ┌──────────────────────┐
│      Renderer        │       │        Main          │
│ (React/TypeScript)   │◄─────►│ (Electron/Node.js)   │
└──────────────────────┘ IPC   └──────────────────────┘
       ▲      │                       ▲       │
       │      └─── UI Events ────────┘       │
       │                                      │
┌──────────────────────┐             ┌──────────────────────┐
│   SpaceTrigger UI       │             │   SpaceTrigger Services │
│   Components         │             │   & Business Logic   │
└──────────────────────┘             └──────────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────────┐
                                    │   Database (TypeORM) │
                                    │   - KeyBindings      │
                                    │   - AppConfig        │
                                    └──────────────────────┘
```

### 2.2 Key Components

- **Renderer Process**: Handles UI presentation using React with TypeScript and Tailwind CSS
- **Main Process**: Manages system-level operations via Electron and Node.js
- **Database**: SQLite with TypeORM for persistent storage of key bindings and configuration
- **IPC**: Strictly typed communication channels connecting renderer and main processes
- **Services**: Business logic layer handling key binding operations and configuration

### 2.3 Process Communication

1. **Renderer → Main**:
   - User interactions trigger IPC calls via `window.electron.SpaceTrigger` API
   - Requests are routed through preload script to main process
2. **Main → Renderer**:
   - Service layer processes requests and returns data/responses
   - Event subscriptions push real-time updates to renderer (e.g., key sequence tracking)
3. **Data Flow**:
   - Configuration changes and key bindings persist to SQLite database
   - All cross-process communication is strictly typed for safety

## 3. Module Specifications

### 3.1 Interface Declaration (Primary Communication Root)

The interface declaration in `src/types/electron.d.ts` serves as the foundational contract:

```ts
declare global {
  interface Window {
    electron: {
      SpaceTrigger: {
        // Core Methods
        setDelay: (delay: number) => Promise<void>;
        getKeyBindings: () => Promise<KeyBinding[]>;
        addBinding: (binding: Omit<KeyBinding, 'id'>) => Promise<KeyBinding>;
        onSequenceUpdate: (callback: (sequence: string[]) => void) => () => void;
      };
    };
  }
}
```

**Implementation Rules:**

1. All IPC communication must be declared here first
2. Method signatures must remain consistent across processes
3. Document changes with version markers

### 3.2 Configuration System

Implementation in `src/shared/config.ts`:

```ts
export const config: StrictConfig = {
  SpaceTrigger: {
    setDelay: createIpcChannel<number, void>('SpaceTrigger/setDelay'),
    getKeyBindings: createIpcChannel<void, KeyBinding[]>('SpaceTrigger/getKeyBindings'),
    addBinding: createIpcChannel<Omit<KeyBinding, 'id'>, KeyBinding>('SpaceTrigger/addBinding'),
    onSequenceUpdate: createSubscriptionChannel<string[]>('SpaceTrigger/onSequenceUpdate'),
  },
};
```

### 3.3 Service Layer

Business logic implementation (`src/main/services/SpaceTrigger.service.ts`):

```ts
class SpaceTriggerService {
  private activationDelay = 300;
  private keyBindings: KeyBinding[] = [];

  async setDelay(delay: number): Promise<void> {
    // 1. Input validation
    if (delay < 100 || delay > 1000) throw new Error('Invalid delay range');

    // 2. Core processing
    this.activationDelay = delay;

    // 3. Persist to database
    await this.saveConfig();
  }

  // Additional service methods...
}
```

### 3.4 IPC Handlers

Connection between config and services (`src/main/ipc/SpaceTrigger.ipc.ts`):

```ts
// Handle delay configuration
config.SpaceTrigger.setDelay.handle(async delay => {
  try {
    await SpaceTriggerService.setDelay(delay);
  } catch (error) {
    logger.error('Failed to set delay', error);
    throw error;
  }
});
```

### 3.5 UI Implementation Guide

React component example (`src/renderer/pages/Home/Home.tsx`):

```tsx
function useKeyBindings() {
  const [bindings, setBindings] = useState<KeyBinding[]>([]);

  useEffect(() => {
    const loadBindings = async () => {
      try {
        const data = await window.electron.SpaceTrigger.getKeyBindings();
        setBindings(data);
      } catch (error) {
        console.error('Failed to load bindings', error);
      }
    };
    loadBindings();
  }, []);

  return bindings;
}
```

## 4. User Interface Interaction Flow

SpaceTrigger features two core interfaces that facilitate distinct user interactions:

### 4.1 Dashboard UI (Configuration Interface)

- **Purpose**: Central management hub for system configuration
- **Key Functions**:
  - Create/update/delete key bindings
  - Set activation delay (default: 500ms)
  - Configure application paths and command types
  - Add descriptive comments to bindings
- **Interaction Workflow**:
  1. User launches dashboard via system tray icon
  2. Interface presents tabular view of existing bindings
  3. User can perform CRUD operations on bindings
  4. All changes auto-save to database
  5. Settings changes apply immediately system-wide

**Visual Representation**:

```
╔═══════════════════════════ SpaceTrigger ═════════════════════╗
║                                                           ║
║  Key Bindings                                             ║
║  ┌───────────────┬───────────────┬──────────────────────┐ ║
║  │ Sequence      │ Action        │ Comment              │ ║
║  ├───────────────┼───────────────┼──────────────────────┤ ║
║  │ c o d e       │ Launch App    │ VS Code Editor       │ ║
║  │ a             │ Launch App    │ Android Studio       │ ║
║  └───────────────┴───────────────┴──────────────────────┘ ║
║                                                           ║
║  [Add Binding]  [Settings]  [Import/Export]               ║
╚═══════════════════════════════════════════════════════════╝
```

### 4.2 Notice UI (Command Selection Interface)

- **Trigger**: Space key hold > configured delay
- **Behavior**:
  - Centered overlay with semi-transparent background
  - Real-time command filtering as user types
  - Displays matches in clean, minimal format
- **Interaction Workflow**:
  1. System detects Space key hold exceeding delay
  2. Notice UI appears with all available commands
  3. User types additional keys to filter options
  4. UI updates dynamically showing matches
  5. Actions:
     - Complete sequence → execute command
     - Release Space → cancel without action

**Visual Representation**:

```
          ╔════════════════ SpaceTrigger ═══════════════╗
          ║                                          ║
          ║  Type to filter commands...              ║
          ║                                          ║
          ║  c o d e   Launch VS Code (App)          ║
          ║  a         Launch Android Studio (App)   ║
          ║                                          ║
          ╚══════════════════════════════════════════╝
```

### Visual Workflow Summary

```
User Action          │ System Response
─────────────────────┼───────────────────────────────────
Hold Space key       ▶ Starts delay timer (500ms)
                     │
Timer completes      ▶ Shows Notice UI centered
                     ▶ Displays all available commands
                     │
Types 'c'            ▶ Filters to commands starting with 'c'
                     │
Types 'o'            ▶ Filters to commands starting with 'co'
                     │
Releases Space       ▶ Closes Notice UI (no action)
or                   │
Completes sequence   ▶ Executes command
                     ▶ Closes Notice UI
```

````markdown
## 5. Data Model Specification

### 5.1 KeyBinding Entity

```ts
@Entity()
export class KeyBinding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  sequence: string; // Formatted as "c o d e"

  @Column({ type: 'varchar', length: 20 })
  actionType: 'launch-app' | 'run-command' | 'execute-script';

  @Column({ type: 'text' })
  target: string; // Path or command

  @Column({ type: 'text', nullable: true })
  comment?: string;
}
```
````

### 5.2 AppConfig Entity

```ts
@Entity()
export class AppConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, default: 'Space' })
  prefixKey: string;

  @Column({ type: 'int', default: 500 })
  activationDelay: number; // ms

  @Column({ type: 'varchar', default: 'dark' })
  uiTheme: 'light' | 'dark';
}
```
