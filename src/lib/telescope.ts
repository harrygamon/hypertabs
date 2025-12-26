/**
 * Telescope - Fuzzy Search Module
 * 
 * Provides fuzzy search functionality for tabs, history, and bookmarks.
 * Uses fuse.js for fast, typo-tolerant searching.
 */

import Fuse, { type IFuseOptions } from 'fuse.js';
import type { SearchResult, SearchMode, HarpoonState } from './types';
import { getAllTabs, tabToSearchResult } from './tabs';

// =============================================================================
// FUSE.JS CONFIGURATION
// =============================================================================

/**
 * Fuse.js options for fuzzy searching
 * Tuned for good balance between accuracy and typo tolerance
 */
const FUSE_OPTIONS: IFuseOptions<SearchResult> = {
  // Which keys to search in
  keys: [
    { name: 'title', weight: 0.7 },  // Title is more important
    { name: 'url', weight: 0.3 },    // URL is secondary
  ],
  // Threshold: 0 = exact match, 1 = match anything
  // 0.4 is a good balance for typo tolerance
  threshold: 0.4,
  // Include match information for highlighting
  includeMatches: true,
  // Ignore location - match anywhere in the string
  ignoreLocation: true,
  // Minimum characters before searching
  minMatchCharLength: 1,
  // Use extended search for more control
  useExtendedSearch: false,
};

// =============================================================================
// QUERY PARSING
// =============================================================================

/**
 * Search mode prefixes
 * Users can type these at the start of their query to switch modes
 */
const MODE_PREFIXES = {
  history: ['h:', 'H:'],
  bookmarks: ['b:', 'B:'],
} as const;

/**
 * Parses a search query to extract the mode and actual search term
 * 
 * @param query - Raw query string from input
 * @returns Object with mode and cleaned search term
 * 
 * @example
 * parseSearchQuery('h:google')  // { mode: 'history', searchTerm: 'google' }
 * parseSearchQuery('b:recipes') // { mode: 'bookmarks', searchTerm: 'recipes' }
 * parseSearchQuery('github')    // { mode: 'tabs', searchTerm: 'github' }
 */
export function parseSearchQuery(query: string): { mode: SearchMode; searchTerm: string } {
  const trimmedQuery = query.trim();
  
  // Check for history prefix
  for (const prefix of MODE_PREFIXES.history) {
    if (trimmedQuery.startsWith(prefix)) {
      return {
        mode: 'history',
        searchTerm: trimmedQuery.slice(prefix.length).trim(),
      };
    }
  }
  
  // Check for bookmarks prefix
  for (const prefix of MODE_PREFIXES.bookmarks) {
    if (trimmedQuery.startsWith(prefix)) {
      return {
        mode: 'bookmarks',
        searchTerm: trimmedQuery.slice(prefix.length).trim(),
      };
    }
  }
  
  // Default to tabs mode
  return {
    mode: 'tabs',
    searchTerm: trimmedQuery,
  };
}

// =============================================================================
// TAB SEARCH
// =============================================================================

/**
 * Searches through all open tabs across all windows
 * 
 * @param query - Search term (already parsed, without prefix)
 * @param harpoonState - Current harpoon state to mark harpooned tabs
 * @returns Array of matching search results
 */
export async function searchTabs(
  query: string,
  harpoonState: HarpoonState | null
): Promise<SearchResult[]> {
  // Get all open tabs
  const tabs = await getAllTabs();
  
  // Create a map of URL -> harpoon slot for quick lookup
  const harpoonMap = new Map<string, number>();
  if (harpoonState) {
    harpoonState.slots.forEach((slot, index) => {
      if (slot) {
        harpoonMap.set(slot.url, index + 1);
      }
    });
  }
  
  // Convert tabs to search results
  const results: SearchResult[] = tabs
    .filter((tab) => tab.id !== undefined && tab.url) // Filter out invalid tabs
    .map((tab) => {
      const harpoonSlot = tab.url ? harpoonMap.get(tab.url) : undefined;
      return tabToSearchResult(tab, harpoonSlot);
    });
  
  // If no query, return all tabs (sorted by most recently accessed)
  if (!query) {
    return results;
  }
  
  // Perform fuzzy search
  const fuse = new Fuse(results, FUSE_OPTIONS);
  const searchResults = fuse.search(query);
  
  // Extract items from fuse results
  return searchResults.map((result) => result.item);
}

// =============================================================================
// HISTORY SEARCH
// =============================================================================

/**
 * Maximum number of history items to search through
 * Limiting this for performance reasons
 */
const MAX_HISTORY_ITEMS = 1000;

/**
 * Searches through browser history
 * 
 * @param query - Search term
 * @returns Array of matching search results
 */
export async function searchHistory(query: string): Promise<SearchResult[]> {
  // Search history using Chrome's API
  // If query is empty, get recent history
  const historyItems = await chrome.history.search({
    text: query || '',
    maxResults: MAX_HISTORY_ITEMS,
    startTime: 0, // From the beginning of time
  });
  
  // Convert to search results
  const results: SearchResult[] = historyItems
    .filter((item) => item.url && item.title) // Filter out invalid items
    .map((item) => ({
      type: 'history' as const,
      id: item.id || item.url!,
      title: item.title || 'Untitled',
      url: item.url!,
      lastVisited: item.lastVisitTime,
    }));
  
  // If query provided, do additional fuzzy filtering for better results
  if (query) {
    const fuse = new Fuse(results, FUSE_OPTIONS);
    const searchResults = fuse.search(query);
    return searchResults.map((result) => result.item);
  }
  
  // Return results sorted by last visited (most recent first)
  return results.sort((a, b) => (b.lastVisited || 0) - (a.lastVisited || 0));
}

// =============================================================================
// BOOKMARK SEARCH
// =============================================================================

/**
 * Recursively flattens bookmark tree into an array
 * 
 * @param nodes - Bookmark tree nodes
 * @returns Flat array of bookmark items
 */
function flattenBookmarks(
  nodes: chrome.bookmarks.BookmarkTreeNode[]
): chrome.bookmarks.BookmarkTreeNode[] {
  const results: chrome.bookmarks.BookmarkTreeNode[] = [];
  
  for (const node of nodes) {
    // If it's a bookmark (has URL), add it
    if (node.url) {
      results.push(node);
    }
    
    // If it has children (is a folder), recurse
    if (node.children) {
      results.push(...flattenBookmarks(node.children));
    }
  }
  
  return results;
}

/**
 * Searches through bookmarks
 * 
 * @param query - Search term
 * @returns Array of matching search results
 */
export async function searchBookmarks(query: string): Promise<SearchResult[]> {
  // Get entire bookmark tree
  const bookmarkTree = await chrome.bookmarks.getTree();
  
  // Flatten the tree into a searchable array
  const bookmarks = flattenBookmarks(bookmarkTree);
  
  // Convert to search results
  const results: SearchResult[] = bookmarks.map((bookmark) => ({
    type: 'bookmark' as const,
    id: bookmark.id,
    title: bookmark.title || 'Untitled',
    url: bookmark.url || '',
  }));
  
  // If no query, return all bookmarks
  if (!query) {
    return results;
  }
  
  // Perform fuzzy search
  const fuse = new Fuse(results, FUSE_OPTIONS);
  const searchResults = fuse.search(query);
  
  return searchResults.map((result) => result.item);
}
