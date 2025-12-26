# HyperTabs

A privacy-first, keyboard-driven Chrome tab manager combining the best ideas from Harpoon, Telescope, and Hyprland-style workspaces.

## Features

### Harpoon (Quick Access Tabs)
Mark your most important tabs to numbered slots for instant access:
- **Alt+1** through **Alt+4** to jump to harpooned tabs instantly
- Works across all windows
- Tabs persist across browser sessions
- Automatically reopens closed tabs from saved URLs

### Telescope (Fuzzy Search)
Fast fuzzy search across all your tabs, history, and bookmarks:
- **Ctrl+Shift+K** to open search
- Type to fuzzy search open tabs
- `h:` prefix to search history
- `b:` prefix to search bookmarks
- Vim-style navigation (optional)

### Workspaces (Coming Soon)
Hyprland-style tab grouping:
- Create virtual workspaces for different contexts
- Switch workspaces to show/hide groups of tabs
- Save and restore workspaces

## Installation

### From Chrome Web Store
*Coming soon*

### Manual Installation (Developer Mode)
1. Clone this repository:
   ```bash
   git clone https://github.com/harrygamon/hypertabs.git
   cd hypertabs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Development
Run in development mode with hot reload:
```bash
npm run dev
```

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Telescope | `Ctrl+Shift+K` |
| Mark tab to Harpoon | `Ctrl+Shift+M` |
| Jump to Harpoon 1-4 | `Alt+1` through `Alt+4` |
| Next workspace | `Ctrl+Shift+]` |
| Previous workspace | `Ctrl+Shift+[` |

*Customize shortcuts at `chrome://extensions/shortcuts`*

## Search Prefixes

| Prefix | Searches |
|--------|----------|
| (none) | Open tabs |
| `h:` | Browser history |
| `b:` | Bookmarks |

## Privacy

HyperTabs is designed with privacy in mind:
- All data is stored locally using `chrome.storage.local`
- No external servers or analytics
- No tracking or telemetry
- Open source - audit the code yourself

## Tech Stack

- **Svelte** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **CRXJS** - Chrome extension tooling
- **Fuse.js** - Fuzzy search

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

Inspired by:
- [Harpoon](https://github.com/ThePrimeagen/harpoon) by ThePrimeagen
- [Telescope.nvim](https://github.com/nvim-telescope/telescope.nvim)
- [Hyprland](https://hyprland.org/) window manager
