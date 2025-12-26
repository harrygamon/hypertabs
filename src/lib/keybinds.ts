/**
 * Keybind System
 * 
 * Implements a vim-style leader key system for HyperTabs.
 * Uses Space as the leader key with sequences like:
 * - Space Space: Open HyperTabs
 * - Space h a: Add to harpoon
 * - Space 1-4: Jump to harpoon slot
 * 
 * This approach bypasses Chrome's 4 shortcut limit by handling
 * key sequences in a content script.
 */

import type { Settings } from './types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Available keybind actions
 */
export type KeybindAction =
  | 'openHyperTabs'      // Open the main popup
  | 'harpoonAdd'         // Add current tab to harpoon
  | 'harpoonRemove'      // Remove current tab from harpoon
  | 'harpoonList'        // Open harpoon list view
  | 'harpoon1'           // Jump to harpoon slot 1
  | 'harpoon2'           // Jump to harpoon slot 2
  | 'harpoon3'           // Jump to harpoon slot 3
  | 'harpoon4'           // Jump to harpoon slot 4
  | 'harpoon5'           // Jump to harpoon slot 5
  | 'workspaceNext'      // Switch to next workspace
  | 'workspacePrev'      // Switch to previous workspace
  | 'workspaceList'      // Open workspace list
  | 'lastTab'            // Switch to last active tab
  | 'closeTab';          // Close current tab

/**
 * Keybind sequence definition
 */
export interface KeybindDef {
  /** The key sequence (e.g., ['Space', 'h', 'a']) */
  sequence: string[];
  /** Human-readable description */
  description: string;
  /** The action to trigger */
  action: KeybindAction;
}

// =============================================================================
// DEFAULT KEYBINDS
// =============================================================================

/**
 * Default keybind configuration
 * Inspired by Telescope.nvim, Harpoon, and Hyprland
 * 
 * Leader key: Space (must be pressed first)
 * All sequences start with Space
 */
export const DEFAULT_KEYBINDS: KeybindDef[] = [
  // Core
  {
    sequence: ['Space', 'Space'],
    description: 'Open HyperTabs',
    action: 'openHyperTabs',
  },
  
  // Harpoon - Space h [action]
  {
    sequence: ['Space', 'h', 'a'],
    description: 'Add tab to Harpoon',
    action: 'harpoonAdd',
  },
  {
    sequence: ['Space', 'h', 'r'],
    description: 'Remove tab from Harpoon',
    action: 'harpoonRemove',
  },
  {
    sequence: ['Space', 'h', 'o'],
    description: 'Open Harpoon list',
    action: 'harpoonList',
  },
  
  // Harpoon quick access - Space [1-5]
  {
    sequence: ['Space', '1'],
    description: 'Jump to Harpoon slot 1',
    action: 'harpoon1',
  },
  {
    sequence: ['Space', '2'],
    description: 'Jump to Harpoon slot 2',
    action: 'harpoon2',
  },
  {
    sequence: ['Space', '3'],
    description: 'Jump to Harpoon slot 3',
    action: 'harpoon3',
  },
  {
    sequence: ['Space', '4'],
    description: 'Jump to Harpoon slot 4',
    action: 'harpoon4',
  },
  {
    sequence: ['Space', '5'],
    description: 'Jump to Harpoon slot 5',
    action: 'harpoon5',
  },
  
  // Workspaces - Space w [action]
  {
    sequence: ['Space', 'w', 'n'],
    description: 'Next workspace',
    action: 'workspaceNext',
  },
  {
    sequence: ['Space', 'w', 'p'],
    description: 'Previous workspace',
    action: 'workspacePrev',
  },
  {
    sequence: ['Space', 'w', 'o'],
    description: 'Open workspace list',
    action: 'workspaceList',
  },
  
  // Tab operations
  {
    sequence: ['Space', 'l'],
    description: 'Switch to last tab',
    action: 'lastTab',
  },
  {
    sequence: ['Space', 'x'],
    description: 'Close current tab',
    action: 'closeTab',
  },
];

// =============================================================================
// KEYBIND MANAGER CLASS
// =============================================================================

/**
 * Timeout for key sequences (ms)
 * If no key is pressed within this time, sequence resets
 */
const SEQUENCE_TIMEOUT = 1000;

/**
 * Manages keybind detection and action triggering
 */
export class KeybindManager {
  /** Current key sequence being built */
  private currentSequence: string[] = [];
  
  /** Timeout handle for resetting sequence */
  private sequenceTimeout: ReturnType<typeof setTimeout> | null = null;
  
  /** Registered keybinds */
  private keybinds: KeybindDef[];
  
  /** Callback when an action is triggered */
  private onAction: (action: KeybindAction) => void;
  
  /** Whether keybinds are enabled */
  private enabled: boolean = true;
  
  /** Callback for sequence updates (for UI feedback) */
  private onSequenceUpdate?: (sequence: string[]) => void;

  constructor(
    keybinds: KeybindDef[],
    onAction: (action: KeybindAction) => void,
    onSequenceUpdate?: (sequence: string[]) => void
  ) {
    this.keybinds = keybinds;
    this.onAction = onAction;
    this.onSequenceUpdate = onSequenceUpdate;
  }

  /**
   * Handles a keydown event
   * Returns true if the key was consumed (part of a sequence)
   */
  handleKeyDown(event: KeyboardEvent): boolean {
    if (!this.enabled) return false;
    
    // Ignore if in an input field (unless it's our popup)
    const target = event.target as HTMLElement;
    if (this.isInputElement(target)) {
      return false;
    }
    
    // Get the key name
    const key = this.getKeyName(event);
    if (!key) return false;
    
    // Check if this could be the start of a sequence (Space)
    if (this.currentSequence.length === 0 && key !== 'Space') {
      return false;
    }
    
    // Add to current sequence
    this.currentSequence.push(key);
    this.resetTimeout();
    
    // Notify UI of sequence update
    this.onSequenceUpdate?.(this.currentSequence);
    
    // Check for matching keybind
    const match = this.findMatch();
    
    if (match === 'exact') {
      // Found exact match - trigger action
      const keybind = this.keybinds.find(
        kb => this.sequencesMatch(kb.sequence, this.currentSequence)
      );
      if (keybind) {
        event.preventDefault();
        event.stopPropagation();
        this.onAction(keybind.action);
        this.resetSequence();
        return true;
      }
    } else if (match === 'partial') {
      // Partial match - keep building sequence
      event.preventDefault();
      event.stopPropagation();
      return true;
    } else {
      // No match - reset
      this.resetSequence();
      return false;
    }
    
    return false;
  }

  /**
   * Checks if the target element is an input (text field, etc.)
   */
  private isInputElement(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    const isInput = tagName === 'input' || 
                    tagName === 'textarea' || 
                    tagName === 'select';
    const isEditable = element.isContentEditable;
    
    return isInput || isEditable;
  }

  /**
   * Gets a normalized key name from an event
   */
  private getKeyName(event: KeyboardEvent): string | null {
    // Handle special keys
    if (event.code === 'Space') return 'Space';
    if (event.key === 'Escape') return 'Escape';
    
    // For letter keys, use lowercase
    if (event.key.length === 1 && /[a-zA-Z0-9]/.test(event.key)) {
      return event.key.toLowerCase();
    }
    
    return null;
  }

  /**
   * Finds if current sequence matches any keybind
   * Returns 'exact', 'partial', or 'none'
   */
  private findMatch(): 'exact' | 'partial' | 'none' {
    let hasPartial = false;
    
    for (const keybind of this.keybinds) {
      if (this.sequencesMatch(keybind.sequence, this.currentSequence)) {
        return 'exact';
      }
      if (this.isPartialMatch(keybind.sequence, this.currentSequence)) {
        hasPartial = true;
      }
    }
    
    return hasPartial ? 'partial' : 'none';
  }

  /**
   * Checks if two sequences match exactly
   */
  private sequencesMatch(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((key, i) => key.toLowerCase() === b[i]?.toLowerCase());
  }

  /**
   * Checks if current sequence is a partial match (prefix) of a keybind
   */
  private isPartialMatch(keybind: string[], current: string[]): boolean {
    if (current.length >= keybind.length) return false;
    return current.every((key, i) => key.toLowerCase() === keybind[i]?.toLowerCase());
  }

  /**
   * Resets the current sequence
   */
  private resetSequence(): void {
    this.currentSequence = [];
    if (this.sequenceTimeout) {
      clearTimeout(this.sequenceTimeout);
      this.sequenceTimeout = null;
    }
    this.onSequenceUpdate?.([]);
  }

  /**
   * Resets the timeout for sequence building
   */
  private resetTimeout(): void {
    if (this.sequenceTimeout) {
      clearTimeout(this.sequenceTimeout);
    }
    this.sequenceTimeout = setTimeout(() => {
      this.resetSequence();
    }, SEQUENCE_TIMEOUT);
  }

  /**
   * Enables or disables keybind handling
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.resetSequence();
    }
  }

  /**
   * Updates the keybind configuration
   */
  updateKeybinds(keybinds: KeybindDef[]): void {
    this.keybinds = keybinds;
  }

  /**
   * Gets the current sequence (for UI display)
   */
  getCurrentSequence(): string[] {
    return [...this.currentSequence];
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Formats a key sequence for display
 * e.g., ['Space', 'h', 'a'] -> 'Space h a'
 */
export function formatSequence(sequence: string[]): string {
  return sequence.join(' ');
}

/**
 * Parses a sequence string into an array
 * e.g., 'Space h a' -> ['Space', 'h', 'a']
 */
export function parseSequence(str: string): string[] {
  return str.split(/\s+/).filter(Boolean);
}

/**
 * Gets keybind for a specific action
 */
export function getKeybindForAction(
  action: KeybindAction,
  keybinds: KeybindDef[] = DEFAULT_KEYBINDS
): KeybindDef | undefined {
  return keybinds.find(kb => kb.action === action);
}

/**
 * Formats keybind for display in UI
 * e.g., 'Space h a' or 'SPC h a'
 */
export function formatKeybindDisplay(
  keybind: KeybindDef,
  useShortNames: boolean = false
): string {
  const sequence = keybind.sequence.map(key => {
    if (useShortNames && key === 'Space') return 'SPC';
    return key;
  });
  return sequence.join(' ');
}
