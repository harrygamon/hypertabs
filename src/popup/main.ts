/**
 * Popup Entry Point
 * 
 * Mounts the main Svelte popup component.
 * This is the entry point for the extension's popup UI.
 */

import Popup from './Popup.svelte';

// Mount the Svelte app to the #app element
const app = new Popup({
  target: document.getElementById('app')!,
});

export default app;
