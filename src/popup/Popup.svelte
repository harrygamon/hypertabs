<!--
  Main Popup Component
  
  This is the root component for the extension popup.
  It contains the Telescope search interface, Harpoon bar, and Workspace switcher.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import SearchInput from './components/SearchInput.svelte';
  import TabList from './components/TabList.svelte';
  import HarpoonBar from './components/HarpoonBar.svelte';
  import WorkspaceSwitcher from './components/WorkspaceSwitcher.svelte';
  import type { SearchResult, SearchMode, HarpoonState, WorkspaceState, Settings } from '../lib/types';
  import { get } from '../lib/storage';
  import { searchTabs, searchHistory, searchBookmarks, parseSearchQuery } from '../lib/telescope';

  // ==========================================================================
  // STATE
  // ==========================================================================
  
  /** Current search query (raw input) */
  let query = '';
  
  /** Parsed search mode based on query prefix */
  let mode: SearchMode = 'tabs';
  
  /** Search results to display */
  let results: SearchResult[] = [];
  
  /** Currently selected result index */
  let selectedIndex = 0;
  
  /** Loading state while searching */
  let isLoading = false;
  
  /** Harpoon state for displaying slots and marking harpooned tabs */
  let harpoonState: HarpoonState | null = null;
  
  /** Workspace state for the workspace switcher */
  let workspaceState: WorkspaceState | null = null;
  
  /** User settings */
  let settings: Settings | null = null;

  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================

  onMount(async () => {
    // Load initial state
    harpoonState = await get('harpoon');
    workspaceState = await get('workspaces');
    settings = await get('settings');
    
    // Perform initial search (show all tabs)
    await performSearch();
    
    // Focus the search input
    document.querySelector('input')?.focus();
  });

  // ==========================================================================
  // SEARCH LOGIC
  // ==========================================================================

  /**
   * Performs search based on current query and mode
   */
  async function performSearch() {
    isLoading = true;
    
    // Parse query to determine mode and actual search term
    const { mode: parsedMode, searchTerm } = parseSearchQuery(query);
    mode = parsedMode;
    
    try {
      // Execute search based on mode
      switch (mode) {
        case 'tabs':
          results = await searchTabs(searchTerm, harpoonState);
          break;
        case 'history':
          results = await searchHistory(searchTerm);
          break;
        case 'bookmarks':
          results = await searchBookmarks(searchTerm);
          break;
      }
      
      // Reset selection to top
      selectedIndex = 0;
    } catch (error) {
      console.error('Search error:', error);
      results = [];
    } finally {
      isLoading = false;
    }
  }

  /**
   * Handles query changes from the search input
   */
  function handleQueryChange(event: CustomEvent<string>) {
    query = event.detail;
    performSearch();
  }

  /**
   * Handles keyboard navigation
   */
  function handleKeydown(event: CustomEvent<KeyboardEvent>) {
    const e = event.detail;
    const vimMode = settings?.vimModeEnabled ?? false;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        break;
        
      case 'j':
        if (vimMode) {
          e.preventDefault();
          selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
        }
        break;
        
      case 'k':
        if (vimMode) {
          e.preventDefault();
          selectedIndex = Math.max(selectedIndex - 1, 0);
        }
        break;
        
      case 'Enter':
        e.preventDefault();
        selectResult(selectedIndex);
        break;
        
      case 'Escape':
        // Close the popup
        window.close();
        break;
    }
  }

  /**
   * Handles selecting a result (via Enter or click)
   */
  async function selectResult(index: number) {
    const result = results[index];
    if (!result) return;
    
    // Send message to background script to handle the action
    await chrome.runtime.sendMessage({
      type: 'SELECT_RESULT',
      payload: result,
    });
    
    // Close the popup
    window.close();
  }

  /**
   * Handles clicking on a result
   */
  function handleResultClick(event: CustomEvent<number>) {
    selectResult(event.detail);
  }

  /**
   * Handles clicking on a harpoon slot
   */
  async function handleHarpoonClick(event: CustomEvent<number>) {
    await chrome.runtime.sendMessage({
      type: 'HARPOON_JUMP',
      payload: { slotId: event.detail },
    });
    window.close();
  }

  /**
   * Handles switching workspaces
   */
  async function handleWorkspaceSwitch(event: CustomEvent<string | null>) {
    await chrome.runtime.sendMessage({
      type: 'WORKSPACE_SWITCH',
      payload: { workspaceId: event.detail },
    });
    // Refresh workspace state
    workspaceState = await get('workspaces');
  }

  /**
   * Handles creating a new workspace
   */
  async function handleWorkspaceCreate() {
    const name = prompt('Enter workspace name:');
    if (name) {
      await chrome.runtime.sendMessage({
        type: 'WORKSPACE_CREATE',
        payload: { name },
      });
      // Refresh workspace state
      workspaceState = await get('workspaces');
    }
  }
</script>

<!-- Main popup container -->
<div class="popup">
  <!-- Harpoon quick access bar -->
  <HarpoonBar 
    {harpoonState} 
    on:slotClick={handleHarpoonClick}
  />
  
  <!-- Search input -->
  <SearchInput
    {query}
    {mode}
    on:change={handleQueryChange}
    on:keydown={handleKeydown}
  />
  
  <!-- Results list -->
  <TabList
    {results}
    {selectedIndex}
    {isLoading}
    showUrls={settings?.telescopeShowUrls ?? true}
    on:select={handleResultClick}
  />
  
  <!-- Workspace switcher -->
  <WorkspaceSwitcher
    {workspaceState}
    on:switch={handleWorkspaceSwitch}
    on:create={handleWorkspaceCreate}
  />
  
  <!-- Mode indicator -->
  <div class="mode-indicator">
    {#if mode === 'tabs'}
      Searching open tabs
    {:else if mode === 'history'}
      Searching history (h:)
    {:else}
      Searching bookmarks (b:)
    {/if}
  </div>
</div>

<style>
  .popup {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #1a1a2e;
    color: #eee;
  }

  .mode-indicator {
    padding: 6px 12px;
    font-size: 11px;
    color: #888;
    background-color: #16162a;
    border-top: 1px solid #2a2a4a;
    text-align: center;
  }
</style>
