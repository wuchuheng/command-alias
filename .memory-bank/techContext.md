# Tech Context

_Technologies used, development setup, and technical constraints_

## Core Technology Stack

### Frontend (Renderer Process)

- **React 19.1.0**: UI framework with hooks and modern patterns
- **TypeScript 5.8.3**: Strict type checking with comprehensive declarations
- **Tailwind CSS 3.4.17**: Utility-first styling with custom theme
- **Antd 5.25.4**: Component library for consistent UI elements
- **React Router DOM 7.6.1**: Client-side routing for multi-page experience

### Backend (Main Process)

- **Electron 36.3.2**: Cross-platform desktop application framework
- **Node.js**: Server-side JavaScript runtime
- **TypeORM 0.3.24**: Object-relational mapping for database operations
- **Better SQLite3 11.10.0**: Fast, synchronous SQLite interface
- **Auto-Launch 5.0.6**: System startup integration

### Development Environment

- **Webpack 5+**: Module bundling with custom configurations
- **Electron Forge 7.8.1**: Build, package, and distribution toolkit
- **ESLint 8.57.1**: Code linting with TypeScript support
- **Prettier 3.5.3**: Code formatting with Tailwind plugin
- **ts-node 10.9.2**: TypeScript execution for scripts

## Architecture Patterns

### IPC Communication

- **Strictly Typed Channels**: All IPC communication through typed interfaces
- **Config-Based System**: Centralized channel definitions in `src/shared/config.ts`
- **Subscription Model**: Real-time updates via subscription channels
- **Error Boundaries**: Comprehensive error handling across processes

### Data Layer

```typescript
// Entity Structure
@Entity()
export class CommandAlias {
  @PrimaryGeneratedColumn() id: number;
  @Column({ type: 'varchar', length: 50 }) alias: string;
  @Column({ type: 'varchar', length: 20 }) actionType: 'launch-app' | 'run-command' | 'execute-script';
  @Column({ type: 'text' }) target: string;
  @Column({ type: 'text', nullable: true }) comment?: string;
}
```

### Service Architecture

- **Repository Pattern**: Database access abstraction
- **Service Layer**: Business logic encapsulation
- **Factory Pattern**: Window creation and management
- **Observer Pattern**: Event-driven updates

## System Integration

### Windows Platform

- **Global Shortcuts**: `globalShortcut.register('Ctrl+Space')`
- **Process Detection**: PowerShell `tasklist` integration
- **Window Management**: Win32 API calls via PowerShell
- **System Tray**: Native tray icon with context menu

### Build & Distribution

- **Electron Forge**: Multi-platform builds (Windows/macOS/Linux)
- **Icon Generation**: Automated from SVG source to platform formats
- **ASAR Packaging**: Application bundling with integrity validation
- **Code Signing**: Prepared for distribution channels

## Development Constraints

### Performance Requirements

- **Startup Time**: < 3 seconds to fully operational state
- **Hotkey Response**: < 200ms from Ctrl+Space to UI display
- **Memory Footprint**: < 150MB idle, < 300MB peak usage
- **Database Operations**: < 50ms for typical CRUD operations

### Platform Compatibility

- **Windows**: 10/11 with PowerShell 5.1+
- **macOS**: 10.15+ with native window management
- **Linux**: Ubuntu 18.04+ with X11/Wayland support

### Code Quality Standards

- **TypeScript Strict Mode**: No implicit any, comprehensive type coverage
- **ESLint Rules**: Import resolution, code consistency
- **Prettier Configuration**: 120-character line limit, Tailwind class sorting
- **Documentation**: JSDoc for all public APIs and complex functions
