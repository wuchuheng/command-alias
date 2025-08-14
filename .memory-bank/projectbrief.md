# Project Brief

_Foundation document - Source of truth for project scope_

## Project Identity

**Name**: Command Alias (CA)  
**Type**: Cross-platform Electron application for keyboard shortcuts  
**Purpose**: Rapid application launcher inspired by CommandAlias for macOS  
**Version**: 1.0.0  
**Author**: wuchuheng (root@wuchuheng.com)

## Core Requirements

- **Platform**: Electron 36+ with React 19+ and TypeScript 5+
- **Database**: SQLite with TypeORM for persistent storage
- **Architecture**: Main/Renderer process separation with strict IPC communication
- **UI Framework**: React with Tailwind CSS and Antd components
- **Global Shortcuts**: Ctrl+Space triggers command palette overlay
- **Cross-Platform**: Windows, macOS, and Linux compatibility

## Primary Goals

1. **Instant Application Launch**: Sub-second response time for launching applications
2. **Smart Process Management**: Detect running applications and bring to foreground
3. **Intuitive User Experience**: Simple space-separated key aliases (e.g., "c o d e")
4. **Configuration Dashboard**: Clean interface for managing key bindings
5. **System Integration**: Global hotkeys, system tray, auto-launch support

## Feature Scope

### Core Features

- **Command Palette**: Overlay UI triggered by Ctrl+Space
- **Key Binding Management**: Add/edit/delete custom aliases
- **Application Detection**: Auto-detect installed applications
- **Process Management**: Launch new or focus existing application windows
- **Real-time Filtering**: Type-ahead search in command palette

### Technical Scope

- **Main Process**: Window management, global shortcuts, system operations
- **Renderer Process**: React UI with routing and state management
- **Database Layer**: CommandAlias entity with TypeORM repositories
- **IPC Communication**: Strictly typed channels for process communication
- **System Integration**: Tray icon, auto-launch, Windows process detection
