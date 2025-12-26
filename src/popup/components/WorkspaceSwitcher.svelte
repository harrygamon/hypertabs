<!--
  WorkspaceSwitcher Component
  
  Displays workspace tabs at the bottom of the popup.
  Allows switching between workspaces and shows "All" view option.
-->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { WorkspaceState, Workspace } from '../../lib/types';

  // ==========================================================================
  // PROPS
  // ==========================================================================
  
  /** Current workspace state (null if not loaded yet) */
  export let workspaceState: WorkspaceState | null = null;

  // ==========================================================================
  // EVENT DISPATCHERS
  // ==========================================================================
  
  const dispatch = createEventDispatcher<{
    switch: string | null;  // workspace ID or null for "all"
    create: void;
  }>();

  // ==========================================================================
  // COMPUTED
  // ==========================================================================

  /** Get workspaces to display */
  $: workspaces = workspaceState?.workspaces ?? [];
  
  /** Currently active workspace ID */
  $: activeId = workspaceState?.activeWorkspaceId ?? null;

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  /**
   * Handle clicking on a workspace tab
   */
  function handleWorkspaceClick(workspaceId: string | null): void {
    dispatch('switch', workspaceId);
  }

  /**
   * Handle clicking create button
   */
  function handleCreateClick(): void {
    dispatch('create');
  }

  /**
   * Get display color for a workspace
   */
  function getWorkspaceColor(workspace: Workspace): string {
    const colorMap: Record<string, string> = {
      blue: '#3b82f6',
      red: '#ef4444',
      green: '#22c55e',
      yellow: '#eab308',
      purple: '#a855f7',
      pink: '#ec4899',
      cyan: '#06b6d4',
      orange: '#f97316',
      grey: '#6b7280',
    };
    return colorMap[workspace.color || 'blue'] || '#6366f1';
  }
</script>

<div class="workspace-switcher">
  <!-- "All" tab -->
  <button
    class="workspace-tab"
    class:active={activeId === null}
    on:click={() => handleWorkspaceClick(null)}
    title="Show all tabs"
  >
    All
  </button>
  
  <!-- Workspace tabs -->
  {#each workspaces as workspace (workspace.id)}
    <button
      class="workspace-tab"
      class:active={activeId === workspace.id}
      style="--ws-color: {getWorkspaceColor(workspace)}"
      on:click={() => handleWorkspaceClick(workspace.id)}
      title={workspace.name}
    >
      <span class="workspace-indicator"></span>
      <span class="workspace-name">{workspace.name}</span>
      <span class="workspace-count">{workspace.tabIds.length}</span>
    </button>
  {/each}
  
  <!-- Create new workspace button -->
  <button
    class="workspace-tab create-btn"
    on:click={handleCreateClick}
    title="Create new workspace"
  >
    +
  </button>
</div>

<style>
  .workspace-switcher {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    background-color: #16162a;
    border-top: 1px solid #2a2a4a;
    overflow-x: auto;
    overflow-y: hidden;
  }

  /* Hide scrollbar but allow scrolling */
  .workspace-switcher::-webkit-scrollbar {
    height: 0;
    display: none;
  }

  .workspace-tab {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background-color: #1e1e3f;
    border: 1px solid #2a2a4a;
    border-radius: 4px;
    color: #888;
    font-size: 12px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s ease;
  }

  .workspace-tab:hover {
    background-color: #252550;
    color: #bbb;
  }

  .workspace-tab.active {
    background-color: #2a2a5a;
    border-color: var(--ws-color, #6366f1);
    color: #eee;
  }

  .workspace-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--ws-color, #6366f1);
  }

  .workspace-name {
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .workspace-count {
    font-size: 10px;
    color: #666;
    padding: 1px 4px;
    background-color: #16162a;
    border-radius: 3px;
  }

  .create-btn {
    padding: 4px 8px;
    font-size: 14px;
    color: #666;
  }

  .create-btn:hover {
    color: #6366f1;
  }
</style>
