# Storebox File Explorer

VS Code–style file explorer in the browser: create, rename, and delete files/folders; nest folders; edit file content. Built with React, TypeScript, Tailwind CSS, and Zustand.

## Live demo

`https://code-shelf-three.vercel.app/`

## Setup

Node.js 18+ and npm required.

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Features

- **New File** / **New Folder** — toolbar buttons at root
- **Nested folders** — create inside folders (+ icon or right-click)
- **Edit file** — select file, edit in the main pane
- **Edit folder** — inline rename (pencil or context menu)
- **Delete** — files delete immediately; folders ask for confirmation
- **UI** — dark VS Code–style explorer; folders listed before files
- **Persistence** — tree saved in `localStorage`

## Tech stack

React · TypeScript · Vite · Tailwind CSS · Zustand · UUID · Lucide React

## Notes

- No file-tree libraries — custom recursive `TreeNode` only
- LLMs used: ChatGPT and Cursor (see `chat-history.md`)
- Storebox Frontend take-home assignment
