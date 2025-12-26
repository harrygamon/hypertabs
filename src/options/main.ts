/**
 * Options Page Entry Point
 * 
 * Mounts the settings/options Svelte component.
 */

import Options from './Options.svelte';

const app = new Options({
  target: document.getElementById('app')!,
});

export default app;
