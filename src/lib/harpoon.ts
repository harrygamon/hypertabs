/**
 * Harpoon - Quick Access Tab Management
 * 
 * Provides functionality to mark tabs to numbered slots for instant access.
 * Inspired by ThePrimeagen's harpoon plugin for Neovim.
 * 
 * Key features:
 * - Mark any tab to a slot (1-10)
 * - Jump to harpooned tabs instantly with keyboard shortcuts
 * - Cross-window support (finds tabs in any window)
 * - Persistence: remembers harpooned tabs across browser sessions
 * - Auto-reopen: if a harpooned tab is closed, reopens it from saved URL
 */

import type { HarpoonSlot, HarpoonState } from './types';
import { get, update } from './storage';
import {
  getActiveTab,
  getTabById,
  findTabByUrl,
  switchToTab,
  createTab,
} from './tabs';

// =============================================================================
// STATE MANAGEMENT
// =============================================================================

/**
 * Gets the current harpoon state from storage
 */
export async function getHarpoonState(): Promise<HarpoonState> {
  return await get('harpoon');
}

/**
 * Updates the maximum number of harpoon slots
 * 
 * @param maxSlots - New maximum (1-10)
 */
export async function setMaxSlots(maxSlots: number): Promise<void> {
  // Clamp to valid range
  const clampedMax = Math.max(1, Math.min(10, maxSlots));
  
  await update('harpoon', (state) => ({
    ...state,
    maxSlots: clampedMax,
    // Trim slots array if needed
    slots: state.slots.slice(0, clampedMax),
  }));
}

// =============================================================================
// MARKING TABS
// =============================================================================

/**
 * Marks a tab to a specific harpoon slot
 * 
 * @param slotId - Slot number (1-indexed, 1-10)
 * @param tabId - Optional tab ID. If not provided, uses current active tab
 * @returns The created HarpoonSlot, or null if failed
 */
export async function markToSlot(
  slotId: number,
  tabId?: number
): Promise<HarpoonSlot | null> {
  // Get the tab to mark
  let tab: chrome.tabs.Tab | undefined;
  
  if (tabId !== undefined) {
    tab = await getTabById(tabId);
  } else {
    tab = await getActiveTab();
  }
  
  // Validate tab
  if (!tab || !tab.id || !tab.url) {
    console.error('Harpoon: Cannot mark invalid tab');
    return null;
  }
  
  // Don't allow marking chrome:// or extension pages
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
    console.error('Harpoon: Cannot mark browser internal pages');
    return null;
  }
  
  // Create the harpoon slot
  const slot: HarpoonSlot = {
    id: slotId,
    tabId: tab.id,
    url: tab.url,
    title: tab.title || 'Untitled',
    favicon: tab.favIconUrl,
    windowId: tab.windowId,
  };
  
  // Update storage
  await update('harpoon', (state) => {
    const newSlots = [...state.slots];
    // Ensure array is large enough (slots are 1-indexed)
    while (newSlots.length < slotId) {
      newSlots.push(null);
    }
    // Set the slot (converting from 1-indexed to 0-indexed)
    newSlots[slotId - 1] = slot;
    
    return {
      ...state,
      slots: newSlots,
    };
  });
  
  console.log(`Harpoon: Marked tab "${slot.title}" to slot ${slotId}`);
  return slot;
}

/**
 * Marks the current active tab to the next available slot
 * 
 * @returns The slot number used, or null if all slots are full
 */
export async function markToNextAvailable(): Promise<number | null> {
  const state = await getHarpoonState();
  
  // Find first empty slot
  for (let i = 0; i < state.maxSlots; i++) {
    if (!state.slots[i]) {
      await markToSlot(i + 1); // Convert to 1-indexed
      return i + 1;
    }
  }
  
  console.log('Harpoon: All slots are full');
  return null;
}

// =============================================================================
// REMOVING TABS
// =============================================================================

/**
 * Removes a tab from a harpoon slot
 * 
 * @param slotId - Slot number (1-indexed)
 */
export async function removeFromSlot(slotId: number): Promise<void> {
  await update('harpoon', (state) => {
    const newSlots = [...state.slots];
    // Set to null (converting from 1-indexed to 0-indexed)
    if (slotId > 0 && slotId <= newSlots.length) {
      newSlots[slotId - 1] = null;
    }
    return {
      ...state,
      slots: newSlots,
    };
  });
  
  console.log(`Harpoon: Removed tab from slot ${slotId}`);
}

/**
 * Removes a tab from harpoon by its URL
 * Useful when a tab is closed and we want to clean up
 * 
 * @param url - The URL to remove
 */
export async function removeByUrl(url: string): Promise<void> {
  await update('harpoon', (state) => {
    const newSlots = state.slots.map((slot) => {
      if (slot && slot.url === url) {
        return null;
      }
      return slot;
    });
    return {
      ...state,
      slots: newSlots,
    };
  });
}

/**
 * Clears all harpoon slots
 */
export async function clearAll(): Promise<void> {
  await update('harpoon', (state) => ({
    ...state,
    slots: Array(state.maxSlots).fill(null),
  }));
  
  console.log('Harpoon: Cleared all slots');
}

// =============================================================================
// JUMPING TO TABS
// =============================================================================

/**
 * Jumps to a harpooned tab in a specific slot
 * If the tab was closed, reopens it from the saved URL
 * 
 * @param slotId - Slot number (1-indexed)
 * @returns True if successfully jumped, false otherwise
 */
export async function jumpToSlot(slotId: number): Promise<boolean> {
  const state = await getHarpoonState();
  const slot = state.slots[slotId - 1]; // Convert to 0-indexed
  
  if (!slot) {
    console.log(`Harpoon: Slot ${slotId} is empty`);
    return false;
  }
  
  // First, try to find the tab by its ID
  if (slot.tabId) {
    const tab = await getTabById(slot.tabId);
    if (tab) {
      // Tab still exists, switch to it
      await switchToTab(tab.id!, tab.windowId);
      console.log(`Harpoon: Jumped to slot ${slotId} (tab ID ${slot.tabId})`);
      return true;
    }
  }
  
  // Tab ID is stale, try to find by URL
  const tabByUrl = await findTabByUrl(slot.url);
  if (tabByUrl && tabByUrl.id) {
    // Found the tab by URL, update our stored tab ID and switch
    await update('harpoon', (state) => {
      const newSlots = [...state.slots];
      const existingSlot = newSlots[slotId - 1];
      if (existingSlot) {
        newSlots[slotId - 1] = {
          ...existingSlot,
          tabId: tabByUrl.id,
          windowId: tabByUrl.windowId,
        };
      }
      return { ...state, slots: newSlots };
    });
    
    await switchToTab(tabByUrl.id, tabByUrl.windowId);
    console.log(`Harpoon: Jumped to slot ${slotId} (found by URL)`);
    return true;
  }
  
  // Tab doesn't exist, check if we should reopen it
  const settings = await get('settings');
  if (settings.harpoonReopenClosed) {
    // Reopen the tab
    const newTab = await createTab(slot.url);
    
    // Update the stored tab ID
    if (newTab.id) {
      await update('harpoon', (state) => {
        const newSlots = [...state.slots];
        const existingSlot = newSlots[slotId - 1];
        if (existingSlot) {
          newSlots[slotId - 1] = {
            ...existingSlot,
            tabId: newTab.id,
            windowId: newTab.windowId,
          };
        }
        return { ...state, slots: newSlots };
      });
    }
    
    console.log(`Harpoon: Reopened tab for slot ${slotId}`);
    return true;
  }
  
  console.log(`Harpoon: Tab for slot ${slotId} was closed and reopen is disabled`);
  return false;
}

// =============================================================================
// REORDERING
// =============================================================================

/**
 * Swaps two harpoon slots
 * 
 * @param slotA - First slot number (1-indexed)
 * @param slotB - Second slot number (1-indexed)
 */
export async function swapSlots(slotA: number, slotB: number): Promise<void> {
  await update('harpoon', (state) => {
    const newSlots: (HarpoonSlot | null)[] = [...state.slots];
    const indexA = slotA - 1;
    const indexB = slotB - 1;
    
    // Swap (with null fallback for undefined)
    const temp = newSlots[indexA] ?? null;
    newSlots[indexA] = newSlots[indexB] ?? null;
    newSlots[indexB] = temp;
    
    // Update slot IDs
    if (newSlots[indexA]) {
      newSlots[indexA] = { ...newSlots[indexA]!, id: slotA };
    }
    if (newSlots[indexB]) {
      newSlots[indexB] = { ...newSlots[indexB]!, id: slotB };
    }
    
    return { ...state, slots: newSlots };
  });
  
  console.log(`Harpoon: Swapped slots ${slotA} and ${slotB}`);
}

/**
 * Moves a slot to a new position, shifting others
 * 
 * @param fromSlot - Source slot number (1-indexed)
 * @param toSlot - Destination slot number (1-indexed)
 */
export async function moveSlot(fromSlot: number, toSlot: number): Promise<void> {
  if (fromSlot === toSlot) return;
  
  await update('harpoon', (state) => {
    const newSlots: (HarpoonSlot | null)[] = [...state.slots];
    const fromIndex = fromSlot - 1;
    const toIndex = toSlot - 1;
    
    // Remove from source (default to null if undefined)
    const [moved] = newSlots.splice(fromIndex, 1);
    const movedSlot = moved ?? null;
    
    // Insert at destination
    newSlots.splice(toIndex, 0, movedSlot);
    
    // Update all slot IDs
    const updatedSlots: (HarpoonSlot | null)[] = newSlots.map((slot, index) => {
      if (slot) {
        return { ...slot, id: index + 1 };
      }
      return null;
    });
    
    return { ...state, slots: updatedSlots };
  });
  
  console.log(`Harpoon: Moved slot ${fromSlot} to ${toSlot}`);
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Checks if a URL is currently harpooned
 * 
 * @param url - The URL to check
 * @returns The slot number (1-indexed) if harpooned, undefined otherwise
 */
export async function getSlotForUrl(url: string): Promise<number | undefined> {
  const state = await getHarpoonState();
  
  for (let i = 0; i < state.slots.length; i++) {
    if (state.slots[i]?.url === url) {
      return i + 1; // Convert to 1-indexed
    }
  }
  
  return undefined;
}

/**
 * Syncs harpoon state with current tabs
 * Updates tab IDs for tabs that may have been reopened
 * Call this periodically or on browser startup
 */
export async function syncWithTabs(): Promise<void> {
  const state = await getHarpoonState();
  let needsUpdate = false;
  const newSlots = [...state.slots];
  
  for (let i = 0; i < newSlots.length; i++) {
    const slot = newSlots[i];
    if (!slot) continue;
    
    // Check if stored tab ID is still valid
    if (slot.tabId) {
      const tab = await getTabById(slot.tabId);
      if (!tab) {
        // Tab ID is stale, try to find by URL
        const tabByUrl = await findTabByUrl(slot.url);
        if (tabByUrl && tabByUrl.id) {
          newSlots[i] = {
            ...slot,
            tabId: tabByUrl.id,
            windowId: tabByUrl.windowId,
          };
          needsUpdate = true;
        }
      }
    }
  }
  
  if (needsUpdate) {
    await update('harpoon', (state) => ({ ...state, slots: newSlots }));
    console.log('Harpoon: Synced tab IDs with current tabs');
  }
}
