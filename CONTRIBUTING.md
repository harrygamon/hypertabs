# Contributing to HyperTabs

Thank you for your interest in contributing to HyperTabs! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Chrome browser

### Getting Started

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/hypertabs.git
   cd hypertabs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Load the extension in Chrome:
   - Open `chrome://extensions`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist` folder in the project

The extension will automatically reload when you make changes.

## Project Structure

```
hypertabs/
├── src/
│   ├── background/       # Service worker (runs in background)
│   │   └── index.ts
│   ├── popup/            # Main popup UI
│   │   ├── Popup.svelte
│   │   ├── main.ts
│   │   ├── popup.html
│   │   └── components/   # Svelte components
│   ├── options/          # Settings page
│   ├── lib/              # Shared libraries
│   │   ├── types.ts      # TypeScript types
│   │   ├── storage.ts    # Storage abstraction
│   │   ├── harpoon.ts    # Harpoon logic
│   │   ├── telescope.ts  # Search logic
│   │   └── tabs.ts       # Chrome tabs API wrapper
│   └── assets/           # Icons and static assets
├── manifest.json         # Extension manifest
├── vite.config.ts        # Vite configuration
└── package.json
```

## Code Style

### General Guidelines
- Write clear, readable code with comments explaining "why" not "what"
- Use TypeScript strictly - avoid `any` types
- Keep functions small and focused
- Use meaningful variable and function names

### TypeScript
- All new code should be TypeScript
- Define interfaces for all data structures in `src/lib/types.ts`
- Use proper typing for Chrome APIs

### Svelte Components
- One component per file
- Use script-style-template order
- Add JSDoc comments for props
- Keep styles scoped to components

### Comments
- Add JSDoc comments to all exported functions
- Explain complex logic with inline comments
- Document public APIs thoroughly

## Making Changes

### Branch Naming
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring

### Commit Messages
Use clear, descriptive commit messages:
- `feat: add workspace switching`
- `fix: handle closed tab in harpoon jump`
- `docs: update README with new shortcuts`
- `refactor: simplify storage abstraction`

### Pull Requests
1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly in Chrome
4. Submit a PR with a clear description
5. Link any related issues

## Testing

### Manual Testing
1. Build the extension: `npm run build`
2. Load in Chrome and test all features
3. Check the console for errors
4. Test keyboard shortcuts
5. Test persistence (restart browser)

### Things to Test
- All keyboard shortcuts work
- Harpoon marking and jumping
- Telescope search (tabs, history, bookmarks)
- Settings save and load correctly
- Cross-window functionality
- Edge cases (no tabs, many tabs, etc.)

## Reporting Issues

### Bug Reports
Include:
- Chrome version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)
- Screenshots (if helpful)

### Feature Requests
Include:
- Clear description of the feature
- Why it would be useful
- Any implementation ideas

## Questions?

Feel free to open an issue for questions or discussion.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
