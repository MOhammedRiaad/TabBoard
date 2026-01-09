/**
 * Bookmark filtering utilities
 * Handles filtering of bookmark trees by type and folder
 */

import { Bookmark } from '../../../types';
import { extractDomain } from './domainUtils';

/**
 * Filter type options
 */
export type FilterType = 'all' | 'bookmarks' | 'folders';

/**
 * Filter configuration
 */
export interface FilterConfig {
    type: FilterType;
    folderId?: string; // Filter by specific folder ID
    domain?: string; // Filter by specific domain
}

/**
 * Filter bookmarks by type (All / Bookmarks / Folders)
 * @param bookmarks - Array of bookmarks to filter
 * @param filterType - Type of filter to apply
 * @returns Filtered array of bookmarks
 */
export function filterBookmarksByType(bookmarks: Bookmark[], filterType: FilterType): Bookmark[] {
    if (filterType === 'all') {
        return bookmarks;
    }

    const filtered = bookmarks.filter(bookmark => {
        const isFolder = !bookmark.url;
        if (filterType === 'bookmarks') {
            return !isFolder; // Only bookmarks (has URL)
        } else if (filterType === 'folders') {
            return isFolder; // Only folders (no URL)
        }
        return true;
    });

    // Recursively filter children if they exist
    return filtered.map(bookmark => ({
        ...bookmark,
        children: bookmark.children ? filterBookmarksByType(bookmark.children, filterType) : undefined,
    }));
}

/**
 * Filter bookmarks by folder (show only items in a specific folder)
 * @param bookmarks - Array of bookmarks to filter
 * @param folderId - ID of the folder to filter by
 * @returns Filtered array of bookmarks (only items in the specified folder)
 */
export function filterBookmarksByFolder(bookmarks: Bookmark[], folderId: string): Bookmark[] {
    // Helper to recursively find a folder and return its children
    const findFolderChildren = (items: Bookmark[], targetId: string): Bookmark[] | null => {
        for (const item of items) {
            if (item.id === targetId) {
                // Return the folder with its children structure preserved
                return item.children ? [item] : null;
            }
            if (item.children && item.children.length > 0) {
                const found = findFolderChildren(item.children, targetId);
                if (found !== null) {
                    return found;
                }
            }
        }
        return null;
    };

    // Find the folder and return it with its children
    // This preserves the tree structure for display
    const folderWithChildren = findFolderChildren(bookmarks, folderId);
    if (folderWithChildren && folderWithChildren.length > 0) {
        // Return the folder node with its children
        return folderWithChildren;
    }
    return [];
}

/**
 * Filter bookmarks by domain
 * @param bookmarks - Array of bookmarks to filter
 * @param domain - Domain to filter by
 * @returns Filtered array of bookmarks
 */
export function filterBookmarksByDomain(bookmarks: Bookmark[], domain: string): Bookmark[] {
    const filtered = bookmarks
        .map(bookmark => {
            // If it's a bookmark (has URL), check if domain matches
            if (bookmark.url) {
                const bookmarkDomain = extractDomain(bookmark.url);
                if (bookmarkDomain.toLowerCase() !== domain.toLowerCase()) {
                    return null; // Filter out non-matching bookmarks
                }
                // Matching bookmark - return as is (no children for bookmarks)
                return bookmark;
            }

            // If it's a folder (no URL), recursively filter children
            if (bookmark.children && bookmark.children.length > 0) {
                const filteredChildren = filterBookmarksByDomain(bookmark.children, domain);
                // Only include folder if it has matching children
                if (filteredChildren.length > 0) {
                    return {
                        ...bookmark,
                        children: filteredChildren,
                    };
                }
                return null; // Filter out folders with no matching children
            }

            // Empty folder with no children - filter it out
            return null;
        })
        .filter((bookmark): bookmark is Bookmark => bookmark !== null);

    return filtered;
}

/**
 * Apply filters to a bookmark tree based on filter configuration
 * @param bookmarks - Array of bookmarks to filter
 * @param config - Filter configuration
 * @returns Filtered array of bookmarks
 */
export function filterBookmarks(bookmarks: Bookmark[], config: FilterConfig): Bookmark[] {
    let filtered = bookmarks;

    // First, filter by type
    if (config.type !== 'all') {
        filtered = filterBookmarksByType(filtered, config.type);
    }

    // Then, filter by folder if specified
    if (config.folderId) {
        filtered = filterBookmarksByFolder(filtered, config.folderId);
    }

    // Finally, filter by domain if specified
    if (config.domain) {
        filtered = filterBookmarksByDomain(filtered, config.domain);
    }

    return filtered;
}

/**
 * Get all folders from bookmark tree (for folder filter dropdown)
 * @param bookmarks - Array of bookmarks to extract folders from
 * @returns Array of folder bookmarks
 */
export function getAllFolders(bookmarks: Bookmark[]): Bookmark[] {
    const folders: Bookmark[] = [];

    const traverse = (items: Bookmark[]) => {
        items.forEach(item => {
            // Check if it's a folder (no URL)
            if (!item.url) {
                folders.push(item);
            }
            // Recursively traverse children
            if (item.children && item.children.length > 0) {
                traverse(item.children);
            }
        });
    };

    traverse(bookmarks);
    return folders;
}

/**
 * Get default filter configuration
 */
export function getDefaultFilterConfig(): FilterConfig {
    return {
        type: 'all',
        folderId: undefined,
        domain: undefined,
    };
}

/**
 * Load filter configuration from localStorage
 */
export function loadFilterConfig(): FilterConfig {
    try {
        const saved = localStorage.getItem('tabboard-bookmark-filter');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Validate the saved config
            if (parsed.type && ['all', 'bookmarks', 'folders'].includes(parsed.type)) {
                return {
                    type: parsed.type as FilterType,
                    folderId: parsed.folderId || undefined,
                    domain: parsed.domain || undefined,
                };
            }
        }
    } catch (error) {
        console.warn('Failed to load filter config:', error);
    }
    return getDefaultFilterConfig();
}

/**
 * Save filter configuration to localStorage
 */
export function saveFilterConfig(config: FilterConfig): void {
    try {
        localStorage.setItem('tabboard-bookmark-filter', JSON.stringify(config));
    } catch (error) {
        console.warn('Failed to save filter config:', error);
    }
}
