# Lines of Code

> A simple tool to count lines of code in your projects. Works in your browser and as a desktop app.

## 📑 Table of Contents

- [How to Use](#how-to-use)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
- [Project Structure](#project-structure)
- [Download the App](#download-the-app)
- [License](#license)

## 🚀 How to Use

### Web Version
1. Open the app in your browser
2. Click "Select Folder" and pick a project folder
3. Wait for it to scan all files
4. See the results:
   - Total lines of code
   - Lines per file and folder
   - Which languages you use
   - A tree view of all files
5. Use filters to hide blank lines or comments
6. Add files or folders to ignore if needed

### Desktop Version
1. Download and install the app for your computer
2. Open the app
3. Click "Select Folder" to pick a project
4. Same features as web version, but runs on your computer

## 🔧 How It Works

The app has two parts that work the same way:

**Web Version:** Uses your browser's built-in file picker to read files
**Desktop Version:** Uses your computer's file system directly

Both versions:
- Scan all files in your project folder
- Count lines in each file
- Figure out which programming language each file uses
- Add up all the numbers
- Show you nice charts and lists

The app ignores common folders like `node_modules` and `.git` automatically, so it doesn't waste time scanning things you don't care about.

## 🛠 Tech Stack

| What | Why |
|------|-----|
| Next.js | Modern web framework |
| React | UI library |
| shadcn/ui | Nice-looking components |
| Tailwind CSS | Styling |
| Tauri | Makes desktop apps from web code |
| TypeScript | Type-safe code |

## 📦 Setup & Installation

### What You Need

**For Web:**
- Node.js (version 18 or newer)
- A web browser (Chrome, Edge, Firefox, Safari)

**For Desktop:**
- Everything for web, plus:
- Rust programming language
- Extra tools depending on your computer:
  - Windows: Visual Studio Build Tools
  - Mac: Xcode Command Line Tools
  - Linux: Some system packages

### Install Steps

```bash
# Get the code
git clone <repository-url>
cd lines-of-code

# Install the basics
npm install

# For desktop apps only, install Tauri
npm install --save-dev @tauri-apps/cli
npm install @tauri-apps/api @tauri-apps/plugin-fs @tauri-apps/plugin-dialog

# Set up Tauri (only once)
npx tauri init
```

When it asks questions during setup:
- App name: Lines of Code
- Window title: Lines of Code
- Web assets path: ../out
- Dev server URL: http://localhost:3000
- Frontend dev command: npm run dev
- Frontend build command: npm run build

### Run It

**Web version:**
```bash
npm run dev
```
Open http://localhost:3000 in your browser

**Desktop version:**
```bash
npm run tauri:dev
```
Opens a window on your computer

### Build for Real Use

**Web:**
```bash
npm run build
```

**Desktop:**
```bash
npm run tauri:build
```

**Platform-specific build requirements:**

Windows:
- Install Rust from https://rustup.rs
- Install Visual Studio Build Tools with "Desktop development with C++" workload
- Run: `npm run tauri:build`
- Output: `.exe` installer in `src-tauri/target/release/bundle/nsis/`

macOS:
- Install Xcode Command Line Tools: `xcode-select --install`
- Install Rust from https://rustup.rs
- Run: `npm run tauri:build`
- Output: `.dmg` file in `src-tauri/target/release/bundle/dmg/`

Linux:
- Install Rust from https://rustup.rs
- Install system packages: `sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev`
- Run: `npm run tauri:build`
- Output: `.AppImage` and `.deb` files in `src-tauri/target/release/bundle/`

## 📁 Project Structure

```
lines-of-code/
├── app/              # Main app pages
├── components/       # UI parts like buttons and cards
├── lib/              # Core logic (counting, file reading)
├── workers/          # Background processing
├── __tests__/        # Tests
├── src-tauri/        # Desktop app stuff (Rust code)
├── package.json      # Dependencies
└── config files      # Settings for Next.js, TypeScript, etc.
```

## 💾 Download the App

Download pre-built desktop apps from [GitHub Releases](https://github.com/raktimyoddha07/lines-of-code/releases).

| Platform | File Type | Download |
|----------|-----------|----------|
| Windows | `.exe` installer | [Download(.exe)](https://github.com/raktimyoddha07/lines-of-code/releases/download/Application/LinesOfCode_1.0.0_x64-setup.exe) |


## 📄 License

MIT License - free to use for anything
