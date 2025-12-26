<!--
  HarpoonBar Component
  
  Displays the harpoon quick-access slots at the top of the popup.
  Shows currently harpooned tabs with their favicons and slot numbers.
-->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { HarpoonState, HarpoonSlot } from '../../lib/types';

  // ==========================================================================
  // PROPS
  // ==========================================================================
  
  /** Current harpoon state (null if not loaded yet) */
  export let harpoonState: HarpoonState | null = null;

  // ==========================================================================
  // EVENT DISPATCHERS
  // ==========================================================================
  
  const dispatch = createEventDispatcher<{
    slotClick: number;
  }>();

  // ==========================================================================
  // COMPUTED
  // ==========================================================================

  /**
   * Get the slots to display (filled and empty up to maxSlots)
   */
  $: displaySlots = getDisplaySlots(harpoonState);

  function getDisplaySlots(state: HarpoonState | null): (HarpoonSlot | null)[] {
    if (!state) {
      // Show 5 empty slots while loading
      return [null, null, null, null, null];
    }
    
    // Ensure we have maxSlots number of entries
    const slots: (HarpoonSlot | null)[] = [];
    for (let i = 0; i < state.maxSlots; i++) {
      slots.push(state.slots[i] ?? null);
    }
    return slots;
  }

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  /**
   * Handles clicking on a slot
   */
  function handleSlotClick(slotIndex: number) {
    // Slot IDs are 1-indexed
    dispatch('slotClick', slotIndex + 1);
  }

  /**
   * Gets the keyboard shortcut hint for a slot
   */
  function getShortcutHint(index: number): string {
    // Only show hints for first 4 slots (Alt+1 through Alt+4)
    if (index < 4) {
      return `Alt+${index + 1}`;
    }
    return '';
  }

  /**
   * Fallback favicon as a data URI
   */
  const FALLBACK_FAVICON = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect fill="%23444" width="16" height="16" rx="2"/></svg>';

  /**
   * Handle favicon load error - replace with fallback
   */
  function handleFaviconError(e: Event): void {
    const target = e.currentTarget as HTMLImageElement;
    target.src = FALLBACK_FAVICON;
  }
</script>

<div class="harpoon-bar">
  <span class="harpoon-label" title="Quick access tabs (Harpoon)">🪝</span>
  
  <div class="slots">
    {#each displaySlots as slot, index}
      <button
        class="slot"
        class:empty={!slot}
        class:filled={!!slot}
        on:click={() => handleSlotClick(index)}
        title={slot 
          ? `${slot.title}\n${getShortcutHint(index)}` 
          : `Empty slot ${index + 1}\n${getShortcutHint(index)}`}
      >
        {#if slot}
          <!-- Filled slot: show favicon -->
          <img
            class="slot-favicon"
            src={slot.favicon || FALLBACK_FAVICON}
            alt={slot.title}
            on:error={handleFaviconError}
          />
        {:else}
          <!-- Empty slot: show slot number -->
          <span class="slot-number">{index + 1}</span>
        {/if}
      </button>
    {/each}
  </div>
  
  <!-- Keyboard hint -->
  <span class="keyboard-hint">Alt+#</span>
</div>

<style>
  .harpoon-bar {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: #16162a;
    border-bottom: 1px solid #2a2a4a;
    gap: 10px;
  }

  .harpoon-label {
    font-size: 14px;
    cursor: help;
  }

  .slots {
    display: flex;
    gap: 6px;
    flex: 1;
  }

  .slot {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    border: 1px solid #3a3a5a;
    background-color: #1e1e3f;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .slot:hover {
    border-color: #6366f1;
    background-color: #252550;
  }

  .slot.empty {
    opacity: 0.5;
  }

  .slot.empty:hover {
    opacity: 0.8;
  }

  .slot.filled {
    border-color: #4a4a6a;
  }

  .slot-favicon {
    width: 16px;
    height: 16px;
    border-radius: 2px;
  }

  .slot-number {
    font-size: 11px;
    color: #666;
    font-weight: 500;
  }

  .keyboard-hint {
    font-size: 10px;
    color: #555;
    font-family: monospace;
  }
</style>
