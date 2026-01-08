import { Bookmark } from '../../../types';
import { BoardStoreCreator } from './types';

export interface BookmarkSlice {
    bookmarks: Bookmark[];
    bookmarkTree: Bookmark[];
    isLoading: boolean;
    error: string | null;
    fetchBookmarks: () => Promise<void>;
    fetchBookmark: (id: string) => Promise<Bookmark | null>;
    createBookmark: (bookmark: {
        title: string;
        url?: string;
        parentId?: string;
        index?: number;
    }) => Promise<Bookmark | null>;
    createBookmarkFolder: (folder: { title: string; parentId?: string; index?: number }) => Promise<Bookmark | null>;
    updateBookmark: (id: string, changes: { title?: string; url?: string }) => Promise<Bookmark | null>;
    moveBookmark: (id: string, destination: { parentId?: string; index?: number }) => Promise<Bookmark | null>;
    deleteBookmark: (id: string) => Promise<void>;
    deleteBookmarkTree: (id: string) => Promise<void>;
    searchBookmarks: (query: string) => Promise<Bookmark[]>;
    getBookmarkChildren: (id: string) => Promise<Bookmark[]>;
}

export const createBookmarkSlice: BoardStoreCreator<BookmarkSlice> = set => ({
    bookmarks: [],
    bookmarkTree: [],
    isLoading: false,
    error: null,

    fetchBookmarks: async () => {
        set({ isLoading: true, error: null });
        try {
            console.log('bookmarkSlice: Sending GET_BOOKMARKS message');
            const response = await chrome.runtime.sendMessage({
                type: 'GET_BOOKMARKS',
            });

            console.log('bookmarkSlice: Received response:', response);

            if (response && !response.error) {
                const tree = Array.isArray(response) ? response : [response];
                set({ bookmarkTree: tree, bookmarks: flattenBookmarkTree(tree), isLoading: false });
                console.log('bookmarkSlice: Bookmarks loaded, tree length:', tree.length);
            } else {
                const errorMsg = response?.error || 'Failed to fetch bookmarks';
                console.error('bookmarkSlice: Error response:', errorMsg);
                set({ error: errorMsg, isLoading: false });
            }
        } catch (error) {
            console.error('bookmarkSlice: Exception fetching bookmarks:', error);
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    fetchBookmark: async (id: string) => {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'GET_BOOKMARK',
                payload: { id },
            });

            if (response && !response.error) {
                return response as Bookmark;
            }
            return null;
        } catch (error) {
            console.error('Error fetching bookmark:', error);
            return null;
        }
    },

    createBookmark: async bookmark => {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'CREATE_BOOKMARK',
                payload: bookmark,
            });

            if (response && !response.error) {
                const newBookmark = response as Bookmark;
                // Chrome bookmark events will trigger refresh via listeners
                // Just update local state for immediate UI feedback
                set(state => ({
                    bookmarks: [...state.bookmarks, newBookmark],
                }));
                return newBookmark;
            }
            return null;
        } catch (error) {
            console.error('Error creating bookmark:', error);
            return null;
        }
    },

    createBookmarkFolder: async folder => {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'CREATE_BOOKMARK_FOLDER',
                payload: folder,
            });

            if (response && !response.error) {
                const newFolder = response as Bookmark;
                // Chrome bookmark events will trigger refresh via listeners
                // Just update local state for immediate UI feedback
                set(state => ({
                    bookmarks: [...state.bookmarks, newFolder],
                }));
                return newFolder;
            }
            return null;
        } catch (error) {
            console.error('Error creating bookmark folder:', error);
            return null;
        }
    },

    updateBookmark: async (id, changes) => {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'UPDATE_BOOKMARK',
                payload: { id, changes },
            });

            if (response && !response.error) {
                const updated = response as Bookmark;
                // Chrome bookmark events will trigger refresh via listeners
                // Just update local state for immediate UI feedback
                set(state => ({
                    bookmarks: state.bookmarks.map(b => (b.id === id ? updated : b)),
                }));
                return updated;
            }
            return null;
        } catch (error) {
            console.error('Error updating bookmark:', error);
            return null;
        }
    },

    moveBookmark: async (id, destination) => {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'MOVE_BOOKMARK',
                payload: { id, destination },
            });

            if (response && !response.error) {
                // Chrome bookmark events will trigger refresh via listeners
                return response as Bookmark;
            }
            return null;
        } catch (error) {
            console.error('Error moving bookmark:', error);
            return null;
        }
    },

    deleteBookmark: async id => {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'DELETE_BOOKMARK',
                payload: { id },
            });

            if (response && !response.error) {
                // Chrome bookmark events will trigger refresh via listeners
                // Just update local state for immediate UI feedback
                set(state => ({
                    bookmarks: state.bookmarks.filter(b => b.id !== id),
                }));
            }
        } catch (error) {
            console.error('Error deleting bookmark:', error);
        }
    },

    deleteBookmarkTree: async id => {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'DELETE_BOOKMARK_TREE',
                payload: { id },
            });

            if (response && !response.error) {
                // Chrome bookmark events will trigger refresh via listeners
                // Just update local state for immediate UI feedback
                set(state => ({
                    bookmarks: state.bookmarks.filter(b => b.id !== id && b.parentId !== id),
                }));
            }
        } catch (error) {
            console.error('Error deleting bookmark tree:', error);
        }
    },

    searchBookmarks: async query => {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'SEARCH_BOOKMARKS',
                payload: { query },
            });

            if (response && !response.error) {
                return response as Bookmark[];
            }
            return [];
        } catch (error) {
            console.error('Error searching bookmarks:', error);
            return [];
        }
    },

    getBookmarkChildren: async id => {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'GET_BOOKMARK_CHILDREN',
                payload: { id },
            });

            if (response && !response.error) {
                return response as Bookmark[];
            }
            return [];
        } catch (error) {
            console.error('Error getting bookmark children:', error);
            return [];
        }
    },
});

// Helper function to flatten bookmark tree into a flat array
function flattenBookmarkTree(tree: Bookmark[]): Bookmark[] {
    const result: Bookmark[] = [];

    function traverse(nodes: Bookmark[]) {
        for (const node of nodes) {
            result.push(node);
            if (node.children && node.children.length > 0) {
                traverse(node.children);
            }
        }
    }

    traverse(tree);
    return result;
}
