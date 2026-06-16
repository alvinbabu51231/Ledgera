# CombERP

Desktop-first business application for a manufacturing company.

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development environment (Backend, Frontend, and Electron):
   ```bash
   pnpm dev
   ```

## Architecture

- **Backend:** Fastify + Drizzle ORM + SQLite
- **Frontend:** React + Vite
- **Desktop:** Electron
- **Shared:** TypeScript types

## Folder Structure

- `/backend` - Fastify server and SQLite database logic
- `/frontend` - React application
- `/desktop` - Electron wrapper
- `/database` - SQLite data file location
- `/shared` - Types and logic shared across the stack
