<!--
  TabItem Component
  
  Displays a single search result item with favicon, title, URL, and type indicator.
  Handles hover and selection states.
-->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { SearchResult } from '../../lib/types';

  // ==========================================================================
  // PROPS
  // ==========================================================================
  
  /** The search result to display */
  export let result: SearchResult;
  
  /** Whether to show the URL */
  export let showUrls = true;
  
  /** Whether this item is currently selected (keyboard navigation) */
  export let isSelected = false;

  // ==========================================================================
  // EVENT DISPATCHERS
  // ==========================================================================
  
  const dispatch = createEventDispatcher<{
    click: void;
  }>();

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  /**
   * Returns the type badge label for the result
   */
  function getTypeBadge(type: SearchResult['type']): string {
    switch (type) {
      case 'tab':
        return 'TAB';
      case 'history':
        return 'HISTORY';
      case 'bookmark':
        return 'BOOKMARK';
    }
  }

  /**
   * Truncates a URL for display
   * Removes protocol and truncates if too long
   */
  function formatUrl(url: string): string {
    // Remove protocol
    let formatted = url.replace(/^https?:\/\//, '');
    // Remove trailing slash
    formatted = formatted.replace(/\/$/, '');
    // Truncate if too long
    if (formatted.length > 50) {
      formatted = formatted.substring(0, 50) + '...';
    }
    return formatted;
  }

  /**
   * Fallback favicon as a data URI
   */
  const FALLBACK_FAVICON = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect fill="%23666" width="16" height="16" rx="2"/></svg>';

  /**
   * Handle favicon load error - replace with fallback
   */
  function handleFaviconError(e: Event): void {
    const target = e.currentTarget as HTMLImageElement;
    target.src = FALLBACK_FAVICON;
  }
</script>

<button
  class="tab-item"
  class:selected={isSelected}
  on:click={() => dispatch('click')}
>
  <!-- Favicon -->
  <img
    class="favicon"
    src={result.favicon || FALLBACK_FAVICON}
    alt=""
    on:error={handleFaviconError}
  />
  
  <!-- Content (title and URL) -->
  <div class="content">
    <div class="title-row">
      <!-- Title -->
      <span class="title">{result.title || 'Untitled'}</span>
      
      <!-- Harpoon indicator -->
      {#if result.harpoonSlot !== undefined}
        <span class="harpoon-badge" title="Harpoon slot {result.harpoonSlot}">
          🪝{result.harpoonSlot}
        </span>
      {/if}
    </div>
    
    <!-- URL (if enabled) -->
    {#if showUrls && result.url}
      <span class="url">{formatUrl(result.url)}</span>
    {/if}
  </div>
  
  <!-- Type badge -->
  <span class="type-badge type-{result.type}">
    {getTypeBadge(result.type)}
  </span>
</button>

<style>
  .tab-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    width: 100%;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background-color 0.1s ease;
    color: inherit;
    font-family: inherit;
  }

  .tab-item:hover {
    background-color: #252545;
  }

  .tab-item.selected {
    background-color: #2a2a5a;
  }

  /* Favicon styling */
  .favicon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    border-radius: 2px;
  }

  /* Content area */
  .content {
    flex: 1;
    min-width: 0; /* Enable text truncation */
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .title {
    font-size: 13px;
    color: #eee;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .url {
    font-size: 11px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Harpoon badge */
  .harpoon-badge {
    font-size: 10px;
    padding: 1px 4px;
    background-color: #4a3a6a;
    border-radius: 3px;
    flex-shrink: 0;
  }

  /* Type badge */
  .type-badge {
    font-size: 9px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 3px;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .type-tab {
    background-color: #2a4a3a;
    color: #4ade80;
  }

  .type-history {
    background-color: #4a3a2a;
    color: #fbbf24;
  }

  .type-bookmark {
    background-color: #3a2a4a;
    color: #a78bfa;
  }
</style>
