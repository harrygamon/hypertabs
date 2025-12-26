<!--
  TabList Component
  
  Displays the list of search results with keyboard navigation support.
  Handles scrolling to keep selected item visible.
-->
<script lang="ts">
  import { createEventDispatcher, afterUpdate } from 'svelte';
  import type { SearchResult } from '../../lib/types';
  import TabItem from './TabItem.svelte';

  // ==========================================================================
  // PROPS
  // ==========================================================================
  
  /** Array of search results to display */
  export let results: SearchResult[] = [];
  
  /** Currently selected index for keyboard navigation */
  export let selectedIndex = 0;
  
  /** Whether the search is currently loading */
  export let isLoading = false;
  
  /** Whether to show URLs in the results */
  export let showUrls = true;

  // ==========================================================================
  // EVENT DISPATCHERS
  // ==========================================================================
  
  const dispatch = createEventDispatcher<{
    select: number;
  }>();

  // ==========================================================================
  // REFS & SCROLL HANDLING
  // ==========================================================================
  
  /** Reference to the list container for scroll management */
  let listContainer: HTMLDivElement;

  /**
   * After each update, scroll to keep selected item visible
   */
  afterUpdate(() => {
    if (!listContainer) return;
    
    const selectedElement = listContainer.querySelector('.selected');
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  });

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  /**
   * Handles clicking on a result item
   */
  function handleItemClick(index: number) {
    dispatch('select', index);
  }
</script>

<div class="list-container" bind:this={listContainer}>
  {#if isLoading}
    <!-- Loading state -->
    <div class="loading">
      <span class="spinner"></span>
      <span>Searching...</span>
    </div>
  {:else if results.length === 0}
    <!-- Empty state -->
    <div class="empty">
      <span class="empty-icon">🔎</span>
      <span class="empty-text">No results found</span>
    </div>
  {:else}
    <!-- Results list -->
    <ul class="results-list" role="listbox">
      {#each results as result, index (result.id)}
        <li
          role="option"
          aria-selected={index === selectedIndex}
          class:selected={index === selectedIndex}
        >
          <TabItem
            {result}
            {showUrls}
            isSelected={index === selectedIndex}
            on:click={() => handleItemClick(index)}
          />
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .list-container {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* Custom scrollbar styling */
  .list-container::-webkit-scrollbar {
    width: 6px;
  }

  .list-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .list-container::-webkit-scrollbar-thumb {
    background-color: #3a3a5a;
    border-radius: 3px;
  }

  .list-container::-webkit-scrollbar-thumb:hover {
    background-color: #4a4a6a;
  }

  .results-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .results-list li {
    border-bottom: 1px solid #2a2a4a;
  }

  .results-list li:last-child {
    border-bottom: none;
  }

  /* Loading state */
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 40px;
    color: #888;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #3a3a5a;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Empty state */
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: #888;
    gap: 8px;
  }

  .empty-icon {
    font-size: 32px;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 14px;
  }
</style>
