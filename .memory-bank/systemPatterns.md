# System Patterns

_System architecture, technical decisions, and design patterns_

## Architecture Overview

Command Alias follows a strict **Electron Main/Renderer separation** with **TypeORM data persistence** and **React-based UI**. The system implements event-driven architecture with strongly-typed IPC communication.

```
┌─────────────────────┐       ┌─────────────────────┐
│    Renderer         │       │       Main          │
│  (React/TypeScript) │◄─────►│ (Electron/Node.js)  │
│                     │ IPC   │                     │
│ ┌─────────────────┐ │       │ ┌─────────────────┐ │
│ │   Dashboard     │ │       │ │   Services      │ │
│ │   CommandPalette│ │       │ │   Hotkeys       │ │
│ │   Components    │ │       │ │   Windows       │ │
│ └─────────────────┘ │       │ └─────────────────┘ │
└─────────────────────┘       └─────────────────────┘
                                       │
                               ┌─────────────────────┐
                               │   SQLite Database   │
                               │   (TypeORM)         │
                               │ ┌─────────────────┐ │
                               │ │ CommandAlias    │ │
                               │ │ Welcome         │ │
                               │ └─────────────────┘ │
                               └─────────────────────┘
```

## Key Design Patterns

### 1. **Strictly Typed IPC Communication**

```typescript
// src/shared/config.ts - Single source of truth
export const config: StrictConfig = {
  commandAlias: {
    getAlias: createIpcChannel<void, CommandAlias[]>('CommandAlias/getKeyBindings'),
    addAlias: createIpcChannel<Omit<CommandAlias, 'id'>, void>('CommandAlias/addBinding'),
    toggleApp: createIpcChannel<number, void>('CommandAlias/triggerAction'),
  },
};

// src/types/electron.d.ts - Global interface declaration
declare global {
  interface Window {
    electron: {
      commandAlias: {
        getAlias: () => Promise<CommandAlias[]>;
        addAlias: (binding: Omit<CommandAlias, 'id'>) => Promise<void>;
        toggleApp: (id: number) => Promise<void>;
      };
    };
  }
}
```

### 2. **Repository Pattern with TypeORM**

```typescript
// Service layer abstracts database operations
export const getAlias = async (): Promise<CommandAlias[]> => {
  const repository = getDataSource().getRepository(CommandAlias);
  return repository.find({ order: { alias: 'ASC' } });
};

// Entity definitions with decorators
@Entity()
export class CommandAlias {
  @PrimaryGeneratedColumn() id: number;
  @Column({ type: 'varchar', length: 50 }) alias: string;
  @Column({ type: 'varchar', length: 20 }) actionType: ActionType;
  @Column({ type: 'text' }) target: string;
}
```

### 3. **Factory Pattern for Window Management**

```typescript
// src/main/windows/windowFactory.ts
export const createWindow = (): BrowserWindow => {
  /* Main dashboard */
};
export const createCommandPaletteWindow = (): BrowserWindow => {
  /* Overlay UI */
};

// Service layer manages window lifecycle
export const show = () => mainWindow?.show();
export const hide = () => mainWindow?.hide();
```

### 4. **Observer Pattern for Real-time Updates**

```typescript
// Subscription system for live data updates
const aliasSubscription = createSubscriptionChannel<CommandAlias[]>('CommandAlias/subscribeToKeyBindings');

// Broadcast changes to all subscribers
export const addAlias = async (binding: Omit<CommandAlias, 'id'>) => {
  await repository.save(binding);
  const updatedAliases = await getAlias();
  aliasSubscription.broadcast(updatedAliases);
};
```

### 5. **Service Layer Pattern**

```typescript
// Business logic encapsulation
// src/main/services/alias.service.ts - Data operations
// src/main/services/hotkey.service.ts - Global shortcuts
// src/main/services/mainWindowManager.service.ts - Window lifecycle
```

## Component Relationships

### Main Process Components

- **`main.ts`**: Application entry point, orchestrates initialization
- **IPC Handlers**: Route requests to appropriate services
- **Services**: Encapsulate business logic and system operations
- **Window Factory**: Creates and configures BrowserWindow instances
- **Database Layer**: TypeORM entities and data source management

### Renderer Process Components

- **`App.tsx`**: Root component with routing
- **Pages**: `Home` (dashboard), `CommandPalette` (overlay)
- **Components**: Reusable UI elements with strict prop types
- **Assets**: SVG icons, generated platform-specific icons

### Cross-Process Communication

1. **Type Declarations**: `electron.d.ts` defines the contract
2. **Config System**: `config.ts` centralizes channel definitions
3. **Preload Script**: Exposes safe APIs to renderer
4. **IPC Handlers**: Process requests in main process

## System Integration Patterns

### Global Hotkey Management

```typescript
// Register system-wide shortcuts
globalShortcut.register('Ctrl+Space', () => {
  if (commandPaletteWindow?.isVisible()) {
    commandPaletteWindow.hide();
  } else {
    showCommandPalette();
  }
});
```

### Process Detection (Windows)

```typescript
// PowerShell-based process checking
async function isProcessRunning(executableName: string): Promise<boolean> {
  const cmd = `tasklist /FI "IMAGENAME eq ${executableName}.exe" /FO CSV /NH`;
  // Parse CSV output to detect running processes
}
```

### Application Launch Strategy

1. **Check Process**: Is application already running?
2. **Branch Logic**: Launch new instance OR bring to foreground
3. **Error Handling**: Graceful fallbacks for launch failures

### Tray Icon Management

```typescript
// SVG-based runtime conversion for crisp rendering
async function createSvgTrayIcon(size: number): Promise<Electron.NativeImage | null> {
  const pngBuffer = await sharp(svgPath)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.lanczos3, // High-quality scaling
    })
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  return nativeImage.createFromBuffer(pngBuffer);
}

// Platform-specific tray icon strategy
// macOS: SVG-based conversion for quality
// Windows/Linux: Pre-generated PNG files
```

## Data Flow Patterns

### Command Execution Flow

```
User Presses Ctrl+Space
    ↓
Global Hotkey Handler Triggered
    ↓
Command Palette Window Created/Shown
    ↓
React Component Loads Aliases via IPC
    ↓
User Types Filter → Real-time UI Updates
    ↓
User Selects Command → triggerAction IPC Call
    ↓
Service Layer Executes Action (Launch/Focus)
    ↓
Command Palette Hidden
```

### Configuration Management Flow

```
User Opens Dashboard
    ↓
Load Existing Aliases via IPC
    ↓
User Adds New Binding
    ↓
Validation in UI Layer
    ↓
IPC Call to addAlias Service
    ↓
Database Persistence via Repository
    ↓
Broadcast Update to All Subscribers
    ↓
UI Updates Automatically
```
