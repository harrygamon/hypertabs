/**
 * HyperTabs Type Definitions
 * 
 * This file contains all shared TypeScript interfaces and types
 * used throughout the extension.
 */

// =============================================================================
// HARPOON TYPES
// =============================================================================

/**
 * Represents a single harpoon slot that can hold a quick-access tab
 */
export interface HarpoonSlot {
  /** Slot number (1-10) */
  id: number;
  /** Current Chrome tab ID (may become stale if tab is closed) */
  tabId?: number;
  /** URL for persistence - used to reopen tab if closed */
  url: string;
  /** Tab title for display */
  title: string;
  /** Favicon URL for visual identification */
  favicon?: string;
  /** Window ID where the tab lives */
  windowId?: number;
}

/**
 * Complete harpoon state stored in chrome.storage.local
 */
export interface HarpoonState {
  /** Array of harpoon slots (sparse - empty slots are undefined) */
  slots: (HarpoonSlot | null)[];
  /** Maximum number of slots (user configurable, default 5, max 10) */
  maxSlots: number;
}

// =============================================================================
// TELESCOPE / SEARCH TYPES
// =============================================================================

/**
 * The type of item being searched/displayed
 */
export type SearchResultType = 'tab' | 'history' | 'bookmark';

/**
 * Search mode determined by query prefix
 * - 'tabs': default, search open tabs
 * - 'history': triggered by 'h:' prefix
 * - 'bookmarks': triggered by 'b:' prefix
 */
export type SearchMode = 'tabs' | 'history' | 'bookmarks';

/**
 * A single search result item
 */
export interface SearchResult {
  /** Type of result for rendering and action handling */
  type: SearchResultType;
  /** Unique identifier (tab ID, history ID, or bookmark ID) */
  id: string;
  /** Page title */
  title: string;
  /** Full URL */
  url: string;
  /** Favicon URL */
  favicon?: string;
  /** Window ID (for tabs only) */
  windowId?: number;
  /** Last visit time in ms (for history) */
  lastVisited?: number;
  /** Harpoon slot number if this tab is harpooned */
  harpoonSlot?: number;
}

/**
 * Current state of the telescope search UI
 */
export interface SearchState {
  /** Raw query string including any prefixes */
  query: string;
  /** Parsed search mode based on prefix */
  mode: SearchMode;
  /** Filtered and sorted results */
  results: SearchResult[];
  /** Currently selected result index for keyboard navigation */
  selectedIndex: number;
  /** Whether search is currently loading */
  isLoading: boolean;
}

// =============================================================================
// WORKSPACE TYPES
// =============================================================================

/**
 * Represents a workspace (group of related tabs)
 */
export interface Workspace {
  /** Unique identifier */
  id: string;
  /** User-defined workspace name */
  name: string;
  /** URLs of tabs in this workspace (for persistence/restore) */
  tabUrls: string[];
  /** Tab IDs currently assigned to this workspace */
  tabIds: number[];
  /** Optional color for visual distinction */
  color?: string;
  /** Whether this is the default workspace for new tabs */
  isDefault?: boolean;
}

/**
 * Complete workspace state
 */
export interface WorkspaceState {
  /** All workspaces */
  workspaces: Workspace[];
  /** Currently active workspace ID */
  activeWorkspaceId: string | null;
  /** Mapping of tab IDs to workspace IDs */
  tabToWorkspace: Record<number, string>;
}

// =============================================================================
// SETTINGS TYPES
// =============================================================================

/**
 * Keybind action identifiers
 */
export type KeybindAction =
  | 'openTelescope'
  | 'harpoonMark'
  | 'harpoon1'
  | 'harpoon2'
  | 'harpoon3'
  | 'harpoon4'
  | 'harpoon5'
  | 'workspaceNext'
  | 'workspacePrev'
  | 'navigateUp'
  | 'navigateDown'
  | 'selectItem';

/**
 * User-configurable settings
 */
export interface Settings {
  // -- Keybinds --
  /** Enable vim-style keybinds (j/k for navigation) */
  vimModeEnabled: boolean;
  /** Custom keybind overrides (action -> key combo) */
  keybinds: Partial<Record<KeybindAction, string>>;

  // -- Harpoon --
  /** Number of harpoon slots (1-10) */
  harpoonMaxSlots: number;
  /** Whether to reopen a closed tab when jumping to it */
  harpoonReopenClosed: boolean;

  // -- Telescope --
  /** Show URLs in search results */
  telescopeShowUrls: boolean;
  /** Maximum number of search results to display */
  telescopeMaxResults: number;

  // -- Workspaces --
  /** Default workspace name for uncategorized tabs */
  defaultWorkspaceName: string;

  // -- UI --
  /** Color theme preference */
  theme: 'system' | 'light' | 'dark';
}

// =============================================================================
// MESSAGE TYPES (for communication between popup/background/content scripts)
// =============================================================================

/**
 * Message types for inter-script communication
 */
export type MessageType =
  | 'HARPOON_MARK'
  | 'HARPOON_JUMP'
  | 'HARPOON_REMOVE'
  | 'HARPOON_GET_STATE'
  | 'WORKSPACE_SWITCH'
  | 'WORKSPACE_CREATE'
  | 'WORKSPACE_DELETE'
  | 'SETTINGS_GET'
  | 'SETTINGS_UPDATE';

/**
 * Base message structure for chrome.runtime.sendMessage
 */
export interface Message {
  type: MessageType;
  payload?: unknown;
}

/**
 * Message to mark a tab to a harpoon slot
 */
export interface HarpoonMarkMessage extends Message {
  type: 'HARPOON_MARK';
  payload: {
    slotId: number;
    tabId?: number; // If not provided, uses current active tab
  };
}

/**
 * Message to jump to a harpoon slot
 */
export interface HarpoonJumpMessage extends Message {
  type: 'HARPOON_JUMP';
  payload: {
    slotId: number;
  };
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Storage keys used in chrome.storage.local
 */
export type StorageKey = 'harpoon' | 'workspaces' | 'settings';

/**
 * Complete storage schema
 */
export interface StorageSchema {
  harpoon: HarpoonState;
  workspaces: WorkspaceState;
  settings: Settings;
}
