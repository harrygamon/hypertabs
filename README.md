# HyperTabs

**Hyprland-Style Tab Management for Power Users**

Transform your browsing with lightning-fast fuzzy search, quick-access harpoon slots, and workspace organization. Perfect for developers and keyboard enthusiasts who want to manage dozens of tabs effortlessly.

Inspired by [Telescope.nvim](https://github.com/nvim-telescope/telescope.nvim), [Harpoon](https://github.com/ThePrimeagen/harpoon), and [Hyprland](https://hyprland.org/).

---

## Key Features

### Instant Fuzzy Search (Telescope)
- Search all open tabs by title or URL in milliseconds
- Type `h:` to search browser history
- Type `b:` to search bookmarks
- Smart fuzzy matching with typo tolerance

### Quick Access Tabs (Harpoon)
- Pin important tabs to numbered slots (1-5)
- Jump instantly with `Alt+1` through `Alt+4`
- Persistent across browser sessions
- Visual hook indicator shows harpooned tabs

### Workspace Organization (Hyprland-style)
- Group related tabs into workspaces
- Switch contexts instantly - hide/show tab groups
- Save window layouts as workspaces
- Perfect for separating work, personal, and project tabs

### Vim-Style Navigation (Optional)
- Full keyboard control with `j`/`k` navigation
- Toggle vim mode in settings
- Arrow keys work by default for everyone

### Privacy First
- All data stays on your device
- No tracking, analytics, or data collection
- Open source with full transparency

---

## Quick Start

1. **Open HyperTabs**: Press `Ctrl+Shift+K` or click the extension icon
2. **Search tabs**: Start typing to filter your tabs
3. **Navigate**: Use arrow keys (or `j`/`k` in vim mode)
4. **Switch**: Press `Enter` to jump to your tab
5. **Close**: Press `Escape`

---

## Keyboard Shortcuts

HyperTabs uses a **leader key system** like Neovim. Press `Space` to start a command sequence.

### Core Commands
| Action | Keybind |
|--------|---------|
| Open HyperTabs | `Space` `Space` |
| Switch to last tab | `Space` `l` |
| Close current tab | `Space` `x` |

### Harpoon Commands
| Action | Keybind |
|--------|---------|
| Add tab to Harpoon | `Space` `h` `a` |
| Remove from Harpoon | `Space` `h` `r` |
| Open Harpoon list | `Space` `h` `o` |
| Jump to slot 1-5 | `Space` `1` - `5` |

### Workspace Commands
| Action | Keybind |
|--------|---------|
| Next workspace | `Space` `w` `n` |
| Previous workspace | `Space` `w` `p` |
| Workspace list | `Space` `w` `o` |

### In-Popup Navigation
| Action | Key |
|--------|-----|
| Move down | `↓` or `j` (vim mode) |
| Move up | `↑` or `k` (vim mode) |
| Select tab | `Enter` |
| Close popup | `Escape` |

### Search Prefixes
| Prefix | Searches |
|--------|----------|
| (none) | Open tabs |
| `h:` | Browser history |
| `b:` | Bookmarks |

### Chrome Shortcuts (Alternative)
You can also use traditional Chrome shortcuts. Set at `chrome://extensions/shortcuts`:

| Action | Default |
|--------|---------|
| Open HyperTabs | `Ctrl+Shift+K` |
| Harpoon slot 1 | `Alt+1` |
| Harpoon slot 2 | `Alt+2` |

---

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
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist` folder

### Development
Run in development mode with hot reload:
```bash
npm run dev
```

---

## How It Works

### Harpoon System
Mark your most important tabs for instant access:
1. Right-click any page → HyperTabs → Add to Harpoon → Choose slot
2. Press `Alt+1` to instantly jump back, even from another window
3. If the tab was closed, it reopens automatically

### Workspaces
Organize tabs into contexts:
1. Click the `+` in the workspace bar to create a workspace
2. Assign tabs via right-click context menu
3. Switch workspaces to focus on one context at a time
4. "All" view shows everything

### Telescope Search
Find any tab instantly:
1. Press `Ctrl+Shift+K` to open
2. Type to fuzzy search titles and URLs
3. Use `h:query` to search history
4. Use `b:query` to search bookmarks

---

## Tech Stack

- **Svelte** - Lightweight UI framework
- **TypeScript** - Type safety
- **Vite + CRXJS** - Fast builds with hot reload
- **Fuse.js** - Fuzzy search

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**Perfect for developers, researchers, and anyone managing 10+ tabs daily.**
