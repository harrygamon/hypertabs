<!--
  Options/Settings Page
  
  Allows users to configure HyperTabs settings including:
  - Vim mode toggle
  - Harpoon slot count
  - UI preferences
  - Import/export settings
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { Settings } from '../lib/types';
  import { get, set, getAll, importData, DEFAULT_SETTINGS } from '../lib/storage';

  // ==========================================================================
  // STATE
  // ==========================================================================
  
  /** Current settings */
  let settings: Settings = { ...DEFAULT_SETTINGS };
  
  /** Whether settings have been modified */
  let isDirty = false;
  
  /** Status message to display */
  let statusMessage = '';
  
  /** Whether we're currently saving */
  let isSaving = false;

  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================

  onMount(async () => {
    // Load current settings
    settings = await get('settings');
  });

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  /**
   * Marks settings as modified
   */
  function markDirty() {
    isDirty = true;
    statusMessage = '';
  }

  /**
   * Saves current settings
   */
  async function saveSettings() {
    isSaving = true;
    try {
      await set('settings', settings);
      isDirty = false;
      statusMessage = 'Settings saved!';
      setTimeout(() => statusMessage = '', 3000);
    } catch (error) {
      statusMessage = 'Error saving settings';
      console.error('Failed to save settings:', error);
    } finally {
      isSaving = false;
    }
  }

  /**
   * Resets settings to defaults
   */
  async function resetToDefaults() {
    if (confirm('Reset all settings to defaults? This cannot be undone.')) {
      settings = { ...DEFAULT_SETTINGS };
      await saveSettings();
    }
  }

  /**
   * Exports all extension data as JSON
   */
  async function exportData() {
    try {
      const data = await getAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `hypertabs-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      statusMessage = 'Data exported!';
      setTimeout(() => statusMessage = '', 3000);
    } catch (error) {
      statusMessage = 'Export failed';
      console.error('Export error:', error);
    }
  }

  /**
   * Imports data from a JSON file
   */
  async function handleImport(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (confirm('Import this data? Current settings will be overwritten.')) {
        await importData(data);
        settings = await get('settings');
        statusMessage = 'Data imported!';
        setTimeout(() => statusMessage = '', 3000);
      }
    } catch (error) {
      statusMessage = 'Import failed - invalid file';
      console.error('Import error:', error);
    }
    
    // Reset the input
    input.value = '';
  }
</script>

<div class="options-page">
  <header>
    <h1>HyperTabs Settings</h1>
    <p class="subtitle">Configure your tab management experience</p>
  </header>

  <main>
    <!-- Keybinds Section -->
    <section class="settings-section">
      <h2>Keybinds</h2>
      
      <label class="setting-row toggle">
        <span class="setting-label">
          <span class="label-text">Vim Mode</span>
          <span class="label-hint">Use j/k for navigation in search results</span>
        </span>
        <input
          type="checkbox"
          bind:checked={settings.vimModeEnabled}
          on:change={markDirty}
        />
      </label>
      
      <p class="info-text">
        Keyboard shortcuts are configured in Chrome. Go to <code>chrome://extensions/shortcuts</code> to customize.
      </p>
    </section>

    <!-- Harpoon Section -->
    <section class="settings-section">
      <h2>Harpoon (Quick Access)</h2>
      
      <label class="setting-row">
        <span class="setting-label">
          <span class="label-text">Number of Slots</span>
          <span class="label-hint">How many quick-access slots to show (1-10)</span>
        </span>
        <input
          type="number"
          min="1"
          max="10"
          bind:value={settings.harpoonMaxSlots}
          on:change={markDirty}
        />
      </label>
      
      <label class="setting-row toggle">
        <span class="setting-label">
          <span class="label-text">Reopen Closed Tabs</span>
          <span class="label-hint">Automatically reopen tabs that were closed</span>
        </span>
        <input
          type="checkbox"
          bind:checked={settings.harpoonReopenClosed}
          on:change={markDirty}
        />
      </label>
    </section>

    <!-- Telescope Section -->
    <section class="settings-section">
      <h2>Telescope (Search)</h2>
      
      <label class="setting-row toggle">
        <span class="setting-label">
          <span class="label-text">Show URLs</span>
          <span class="label-hint">Display URLs below tab titles in search results</span>
        </span>
        <input
          type="checkbox"
          bind:checked={settings.telescopeShowUrls}
          on:change={markDirty}
        />
      </label>
      
      <label class="setting-row">
        <span class="setting-label">
          <span class="label-text">Max Results</span>
          <span class="label-hint">Maximum number of search results to show</span>
        </span>
        <input
          type="number"
          min="10"
          max="100"
          bind:value={settings.telescopeMaxResults}
          on:change={markDirty}
        />
      </label>
    </section>

    <!-- Appearance Section -->
    <section class="settings-section">
      <h2>Appearance</h2>
      
      <label class="setting-row">
        <span class="setting-label">
          <span class="label-text">Theme</span>
          <span class="label-hint">Color scheme preference</span>
        </span>
        <select bind:value={settings.theme} on:change={markDirty}>
          <option value="system">System</option>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </label>
    </section>

    <!-- Data Section -->
    <section class="settings-section">
      <h2>Data Management</h2>
      
      <div class="button-row">
        <button class="btn secondary" on:click={exportData}>
          Export Data
        </button>
        
        <label class="btn secondary file-input">
          Import Data
          <input type="file" accept=".json" on:change={handleImport} hidden />
        </label>
        
        <button class="btn danger" on:click={resetToDefaults}>
          Reset to Defaults
        </button>
      </div>
    </section>
  </main>

  <!-- Footer with save button -->
  <footer>
    {#if statusMessage}
      <span class="status-message">{statusMessage}</span>
    {/if}
    
    <button
      class="btn primary"
      disabled={!isDirty || isSaving}
      on:click={saveSettings}
    >
      {isSaving ? 'Saving...' : 'Save Settings'}
    </button>
  </footer>
</div>

<style>
  .options-page {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  header {
    text-align: center;
    margin-bottom: 10px;
  }

  header h1 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .subtitle {
    color: #888;
    font-size: 14px;
  }

  /* Sections */
  .settings-section {
    background-color: #1e1e3f;
    border-radius: 8px;
    padding: 20px;
  }

  .settings-section h2 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #2a2a4a;
  }

  /* Setting rows */
  .setting-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #2a2a4a;
  }

  .setting-row:last-child {
    border-bottom: none;
  }

  .setting-label {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .label-text {
    font-weight: 500;
  }

  .label-hint {
    font-size: 12px;
    color: #888;
  }

  /* Inputs */
  input[type="number"],
  select {
    background-color: #16162a;
    border: 1px solid #3a3a5a;
    border-radius: 4px;
    padding: 8px 12px;
    color: #eee;
    font-size: 14px;
    min-width: 80px;
  }

  input[type="number"]:focus,
  select:focus {
    outline: none;
    border-color: #6366f1;
  }

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  /* Info text */
  .info-text {
    margin-top: 12px;
    font-size: 12px;
    color: #888;
  }

  .info-text code {
    background-color: #16162a;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: monospace;
  }

  /* Buttons */
  .button-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .btn {
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.15s ease;
  }

  .btn.primary {
    background-color: #6366f1;
    color: white;
  }

  .btn.primary:hover:not(:disabled) {
    background-color: #5558e3;
  }

  .btn.primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn.secondary {
    background-color: #2a2a4a;
    color: #eee;
  }

  .btn.secondary:hover {
    background-color: #3a3a5a;
  }

  .btn.danger {
    background-color: #dc2626;
    color: white;
  }

  .btn.danger:hover {
    background-color: #b91c1c;
  }

  .file-input {
    display: inline-block;
  }

  /* Footer */
  footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;
    padding-top: 20px;
    border-top: 1px solid #2a2a4a;
  }

  .status-message {
    font-size: 14px;
    color: #4ade80;
  }
</style>
