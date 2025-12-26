<!--
  SearchInput Component
  
  The main search input for Telescope functionality.
  Displays current search mode and handles user input.
-->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { SearchMode } from '../../lib/types';

  // ==========================================================================
  // PROPS
  // ==========================================================================
  
  /** Current query string */
  export let query = '';
  
  /** Current search mode (tabs, history, bookmarks) */
  export let mode: SearchMode = 'tabs';

  // ==========================================================================
  // EVENT DISPATCHERS
  // ==========================================================================
  
  const dispatch = createEventDispatcher<{
    change: string;
    keydown: KeyboardEvent;
  }>();

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  /**
   * Handles input changes and dispatches the new value
   */
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    dispatch('change', target.value);
  }

  /**
   * Handles keydown events for navigation
   * Passes the event up to parent for handling
   */
  function handleKeydown(event: KeyboardEvent) {
    dispatch('keydown', event);
  }

  /**
   * Returns the appropriate placeholder based on mode
   */
  function getPlaceholder(mode: SearchMode): string {
    switch (mode) {
      case 'tabs':
        return 'Search tabs... (h: history, b: bookmarks)';
      case 'history':
        return 'Search history...';
      case 'bookmarks':
        return 'Search bookmarks...';
    }
  }

  /**
   * Returns the icon for current mode
   */
  function getModeIcon(mode: SearchMode): string {
    switch (mode) {
      case 'tabs':
        return '🔍';
      case 'history':
        return '📜';
      case 'bookmarks':
        return '⭐';
    }
  }
</script>

<div class="search-container">
  <!-- Mode icon indicator -->
  <span class="mode-icon">{getModeIcon(mode)}</span>
  
  <!-- Search input field -->
  <input
    type="text"
    class="search-input"
    value={query}
    placeholder={getPlaceholder(mode)}
    on:input={handleInput}
    on:keydown={handleKeydown}
    autocomplete="off"
    spellcheck="false"
  />
  
  <!-- Clear button (shown when query is not empty) -->
  {#if query.length > 0}
    <button
      class="clear-button"
      on:click={() => dispatch('change', '')}
      aria-label="Clear search"
    >
      ×
    </button>
  {/if}
</div>

<style>
  .search-container {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: #1e1e3f;
    border-bottom: 1px solid #2a2a4a;
    gap: 8px;
  }

  .mode-icon {
    font-size: 16px;
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #eee;
    font-size: 14px;
    font-family: inherit;
  }

  .search-input::placeholder {
    color: #666;
  }

  .clear-button {
    background: none;
    border: none;
    color: #666;
    font-size: 18px;
    cursor: pointer;
    padding: 0 4px;
    line-height: 1;
    transition: color 0.15s ease;
  }

  .clear-button:hover {
    color: #aaa;
  }
</style>
