/**
 * Content Script - Keybind Handler
 * 
 * This script runs on all web pages and listens for HyperTabs keybinds.
 * It uses a leader key system (Space) to avoid conflicts with web pages.
 * 
 * Key sequences like "Space Space" or "Space h a" are captured and
 * forwarded to the background script for action.
 */

import { KeybindManager, DEFAULT_KEYBINDS, type KeybindAction } from '../lib/keybinds';

// =============================================================================
// INITIALIZATION
// =============================================================================

/** Visual indicator element for showing current sequence */
let sequenceIndicator: HTMLDivElement | null = null;

/** The keybind manager instance */
let keybindManager: KeybindManager;

/**
 * Initialize the keybind system
 */
function init(): void {
  console.log('HyperTabs: Content script loaded');
  
  // Create the keybind manager
  keybindManager = new KeybindManager(
    DEFAULT_KEYBINDS,
    handleAction,
    handleSequenceUpdate
  );
  
  // Listen for keydown events
  document.addEventListener('keydown', handleKeyDown, true);
  
  // Listen for messages from background/popup
  chrome.runtime.onMessage.addListener(handleMessage);
  
  // Create sequence indicator (hidden by default)
  createSequenceIndicator();
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

/**
 * Handles keydown events
 */
function handleKeyDown(event: KeyboardEvent): void {
  // Let the keybind manager process the key
  const consumed = keybindManager.handleKeyDown(event);
  
  // If consumed, the event has already been prevented
  if (consumed) {
    // Show the sequence indicator briefly
    showSequenceIndicator();
  }
}

/**
 * Handles actions triggered by keybinds
 */
async function handleAction(action: KeybindAction): Promise<void> {
  console.log('HyperTabs: Action triggered:', action);
  
  // Hide the sequence indicator
  hideSequenceIndicator();
  
  // Send message to background script
  try {
    await chrome.runtime.sendMessage({
      type: 'KEYBIND_ACTION',
      payload: { action },
    });
  } catch (error) {
    console.error('HyperTabs: Failed to send action:', error);
  }
}

/**
 * Handles sequence updates (for visual feedback)
 */
function handleSequenceUpdate(sequence: string[]): void {
  if (sequence.length > 0) {
    updateSequenceIndicator(sequence);
    showSequenceIndicator();
  } else {
    hideSequenceIndicator();
  }
}

/**
 * Handles messages from background script
 */
function handleMessage(
  message: { type: string; payload?: unknown },
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void
): boolean {
  switch (message.type) {
    case 'DISABLE_KEYBINDS':
      keybindManager.setEnabled(false);
      sendResponse({ success: true });
      break;
      
    case 'ENABLE_KEYBINDS':
      keybindManager.setEnabled(true);
      sendResponse({ success: true });
      break;
      
    case 'GET_KEYBIND_STATUS':
      sendResponse({ enabled: true });
      break;
  }
  
  return false;
}

// =============================================================================
// SEQUENCE INDICATOR UI
// =============================================================================

/**
 * Creates the visual sequence indicator element
 */
function createSequenceIndicator(): void {
  // Check if already exists
  if (document.getElementById('hypertabs-sequence-indicator')) {
    sequenceIndicator = document.getElementById('hypertabs-sequence-indicator') as HTMLDivElement;
    return;
  }
  
  // Create the indicator element
  sequenceIndicator = document.createElement('div');
  sequenceIndicator.id = 'hypertabs-sequence-indicator';
  
  // Apply styles
  Object.assign(sequenceIndicator.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '8px 16px',
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid rgba(99, 102, 241, 0.5)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    zIndex: '2147483647', // Max z-index
    display: 'none',
    transition: 'opacity 0.15s ease',
    pointerEvents: 'none',
  });
  
  document.body.appendChild(sequenceIndicator);
}

/**
 * Updates the sequence indicator content
 */
function updateSequenceIndicator(sequence: string[]): void {
  if (!sequenceIndicator) return;
  
  // Format the sequence with nice styling
  const formatted = sequence.map(key => {
    if (key === 'Space') return '<span style="color: #6366f1;">SPC</span>';
    return `<span style="color: #4ade80;">${key}</span>`;
  }).join(' ');
  
  sequenceIndicator.innerHTML = formatted + '<span style="color: #666;"> ...</span>';
}

/**
 * Shows the sequence indicator
 */
function showSequenceIndicator(): void {
  if (!sequenceIndicator) return;
  sequenceIndicator.style.display = 'block';
  sequenceIndicator.style.opacity = '1';
}

/**
 * Hides the sequence indicator
 */
function hideSequenceIndicator(): void {
  if (!sequenceIndicator) return;
  sequenceIndicator.style.opacity = '0';
  setTimeout(() => {
    if (sequenceIndicator) {
      sequenceIndicator.style.display = 'none';
    }
  }, 150);
}

// =============================================================================
// START
// =============================================================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
