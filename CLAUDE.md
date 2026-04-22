# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server with Turbopack at http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest (run once)
npm run db:reset     # Reset SQLite database (destructive)
```

Run a single test file: `npx vitest run src/path/to/file.test.ts`

## Architecture

UIGen is an AI-powered React component generator. Users describe components in chat; Claude generates them and they render live in a sandboxed preview — all without writing to disk.

### Data flow

1. User sends a chat message → `POST /api/chat` (streaming)
2. Route handler calls the Anthropic API via Vercel AI SDK with two tools:
   - `str_replace_editor` — read/edit files in the virtual FS
   - `file_manager` — create/delete/list files
3. Tool calls mutate a virtual file system (in-memory tree, never touches disk)
4. The client receives streamed tool results and updates `FileSystemContext`
5. The preview iframe re-renders the virtual FS contents live
6. On each response, if the user is authenticated, the project (messages + FS state) is serialized to JSON and saved to SQLite via Prisma

### Key directories

| Path | Purpose |
|---|---|
| `src/app/api/chat/` | Streaming chat endpoint; AI tools defined here |
| `src/lib/file-system.ts` | Virtual FS implementation (in-memory tree, serializable) |
| `src/lib/provider.ts` | AI model provider — uses `claude-haiku-4-5` by default; falls back to `MockLanguageModel` when no API key |
| `src/lib/prompts/` | System prompts for component generation |
| `src/lib/tools/` | Tool definitions (`str_replace_editor`, `file_manager`) |
| `src/lib/contexts/` | `FileSystemContext` and `ChatContext` (React contexts) |
| `src/actions/` | Server actions for auth and project persistence |
| `src/components/chat/` | Chat panel UI |
| `src/components/preview/` | Live preview iframe |
| `src/components/editor/` | Monaco editor + file tree |

### Database (Prisma + SQLite)

Two models: `User` (email/password auth) and `Project` (stores `messages` and `data` as JSON strings). Anonymous projects are supported (`userId` is optional).

### Authentication

Session-based JWT via Jose. Password minimum is 8 characters, bcrypt-hashed. Anonymous usage is fully supported — no account required to generate components.

### UI layout

3-panel resizable layout: **Chat (35%)** | **Preview or Code editor (65%)**. The code view splits further into a file tree (30%) and Monaco editor (70%).

### Environment

Create a `.env` file with `ANTHROPIC_API_KEY=your_key`. Without it, the app falls back to a `MockLanguageModel` that returns static placeholder responses (useful for UI development without API costs).
