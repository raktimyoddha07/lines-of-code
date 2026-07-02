# Lines of Code 📊

A local-first, privacy-respecting web application to scan, count, and analyze code lines in your local directories entirely inside the browser. No files are ever uploaded to a server.

## Features

- **Total Statistics**: See total lines, files, folders, and language count matching your active filter.
- **Language Composition Chart**: A GitHub-style percentage bar visualizing the repository's language breakdown.
- **Collapsible File Tree**: Navigate your project structure with real-time, bottom-up aggregated line counts per folder.
- **Comment and Blank Filtering**: Instantly toggle between:
  - *All lines* (Default)
  - *No Blank Lines* (Excludes blank lines)
  - *No Comments* (Excludes comment lines)
  - *Code Only* (Excludes both blank lines and comments)
- **Advanced Ignored Paths**: 
  - Automatically filters out build directories, lock files, maps, and vector images by default.
  - Supports adding custom relative path and glob patterns (e.g. `**/*.test.ts`, `dist/`).
  - Struck-through visual feedback in the file tree with instant "restore" actions.
- **Fast Performance**: File scanning, binary file detection, and parsing are executed on background threads using **Web Workers** to maintain a smooth 60fps UI.

## Tech Stack

- **Next.js** (App Router, TypeScript)
- **shadcn/ui** & **Radix UI** (Tailwind CSS, Buttons, Cards, Dialogs, Progress, ScrollArea, Tabs, Badges)
- **Web Workers API** (for background filesystem crawling)
- **Vitest** (for testing core parsing and comment-stripping algorithms)

---

## Getting Started

### 1. Installation

First, clone the repository, navigate into the directory, and install dependencies:

```bash
npm install
```

### 2. Run the Development Server

Start the Next.js local server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in Chrome, Edge, Opera, or Firefox to interact with the application.

*Note: The primary directory picker uses the native browser **File System Access API** (Chrome, Edge, Opera). Firefox and Safari will seamlessly fall back to an upload-based directory scan.*

### 3. Run the Unit Tests

We have complete coverage on the parsing, glob-to-regex conversion, and comment-stripping algorithms:

```bash
npm run test
```

---

## Project Structure

```
├── app/
│   ├── page.tsx               # Main analytics dashboard
│   ├── layout.tsx             # HTML structure & metadata config
│   └── globals.css            # Tailwind directives & theme colors
├── components/
│   ├── ui/                    # Base Radix & shadcn components
│   ├── folder-picker.tsx      # Native & fallback file inputs
│   ├── summary-cards.tsx      # Metrics cards row
│   ├── language-chart.tsx     # Custom stacked brand colors legend
│   ├── file-tree.tsx          # Dynamic viewport tree view
│   ├── file-tree-row.tsx      # Individual row styling and actions
│   └── ignore-list-panel.tsx  # Glob exclusion manager
├── lib/
│   ├── types.ts               # Node and filter models
│   ├── languages.ts           # File extension mapping
│   ├── ignore-defaults.ts     # Excluded folder/file rules
│   ├── ignore-match.ts        # Glob matching engine
│   ├── count-lines.ts         # Line counting & binary sniffing
│   ├── build-tree.ts          # Rebuilds flat arrays to nested structure
│   ├── aggregate.ts           # Aggregates lines counts bottom-up
│   └── colors.ts              # Stable Brand colors
├── workers/
│   └── scan-worker.ts         # Web Worker for non-blocking file processing
└── __tests__/
    ├── count-lines.test.ts    # Line counting unit tests
    └── ignore-match.test.ts   # Ignore engine matching unit tests
```

## License

MIT
