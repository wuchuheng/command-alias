# System Patterns

## Architecture Overview

- Electron main/renderer process separation
- TypeORM for database layer
- React for UI components
- Webpack for bundling

## Key Design Patterns

1. Repository pattern (seen in database/repositories)
2. Factory pattern (windowFactory.ts)
3. Service layer pattern (services directory)
4. IPC communication pattern (ipc directory)

## Component Relationships

- Main process handles system operations
- Renderer process manages UI
- Database entities define data structure
- Services contain business logic
- IPC channels facilitate process communication
