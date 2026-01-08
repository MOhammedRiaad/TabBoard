import React, { useEffect, useState } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { Bookmark } from '../../types';
import './BookmarkView.css';
import BookmarkHeader from './components/BookmarkHeader';
import BookmarkTree from './components/BookmarkTree';

const BookmarkView: React.FC = () => {
    const {
        bookmarkTree,
        isLoading,
        error,
        fetchBookmarks,
        createBookmark,
        createBookmarkFolder,
        updateBookmark,
        deleteBookmark,
        deleteBookmarkTree,
        moveBookmark,
        searchBookmarks,
    } = useBoardStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Bookmark[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Load bookmarks when the component mounts
        console.log('BookmarkView: Fetching bookmarks...');
        fetchBookmarks().catch(error => {
            console.error('BookmarkView: Error fetching bookmarks:', error);
        });
    }, [fetchBookmarks]);

    // Listen for bookmark changes from Chrome
    useEffect(() => {
        // Check if chrome.bookmarks API is available
        if (!chrome?.bookmarks) {
            console.warn('Chrome bookmarks API is not available');
            return;
        }

        const handleBookmarkChanged = () => {
            fetchBookmarks();
        };

        const handleBookmarkCreated = () => {
            fetchBookmarks();
        };

        const handleBookmarkRemoved = () => {
            fetchBookmarks();
        };

        const handleBookmarkMoved = () => {
            fetchBookmarks();
        };

        try {
            chrome.bookmarks.onChanged.addListener(handleBookmarkChanged);
            chrome.bookmarks.onCreated.addListener(handleBookmarkCreated);
            chrome.bookmarks.onRemoved.addListener(handleBookmarkRemoved);
            chrome.bookmarks.onMoved.addListener(handleBookmarkMoved);

            return () => {
                try {
                    chrome.bookmarks.onChanged.removeListener(handleBookmarkChanged);
                    chrome.bookmarks.onCreated.removeListener(handleBookmarkCreated);
                    chrome.bookmarks.onRemoved.removeListener(handleBookmarkRemoved);
                    chrome.bookmarks.onMoved.removeListener(handleBookmarkMoved);
                } catch (error) {
                    console.warn('Error removing bookmark listeners:', error);
                }
            };
        } catch (error) {
            console.error('Error setting up bookmark listeners:', error);
        }
    }, [fetchBookmarks]);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.trim()) {
            setIsSearching(true);
            try {
                const results = await searchBookmarks(query);
                setSearchResults(results);
            } catch (error) {
                console.error('Error searching bookmarks:', error);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleCreateBookmark = async (title: string, url: string, parentId?: string) => {
        try {
            await createBookmark({ title, url, parentId });
        } catch (error) {
            console.error('Error creating bookmark:', error);
            alert('Failed to create bookmark. Please try again.');
        }
    };

    const handleCreateFolder = async (title: string, parentId?: string) => {
        try {
            await createBookmarkFolder({ title, parentId });
        } catch (error) {
            console.error('Error creating folder:', error);
            alert('Failed to create folder. Please try again.');
        }
    };

    const handleUpdateBookmark = async (id: string, changes: { title?: string; url?: string }) => {
        try {
            await updateBookmark(id, changes);
        } catch (error) {
            console.error('Error updating bookmark:', error);
            alert('Failed to update bookmark. Please try again.');
        }
    };

    const handleDeleteBookmark = async (id: string, isFolder: boolean) => {
        if (window.confirm(`Are you sure you want to delete this ${isFolder ? 'folder' : 'bookmark'}?`)) {
            try {
                if (isFolder) {
                    await deleteBookmarkTree(id);
                } else {
                    await deleteBookmark(id);
                }
            } catch (error) {
                console.error('Error deleting bookmark:', error);
                alert('Failed to delete bookmark. Please try again.');
            }
        }
    };

    const handleMoveBookmark = async (id: string, destination: { parentId?: string; index?: number }) => {
        try {
            await moveBookmark(id, destination);
        } catch (error) {
            console.error('Error moving bookmark:', error);
            alert('Failed to move bookmark. Please try again.');
        }
    };

    const toggleFolder = (folderId: string) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(folderId)) {
                next.delete(folderId);
            } else {
                next.add(folderId);
            }
            return next;
        });
    };

    // For search results, we need to handle them differently since they're flat
    // For bookmark tree, we pass the tree structure
    const displayData = searchQuery.trim() ? searchResults : bookmarkTree;

    // Debug logging
    useEffect(() => {
        if (bookmarkTree.length > 0) {
            console.log('Bookmark tree loaded:', bookmarkTree);
        }
        if (error) {
            console.error('Bookmark error:', error);
        }
    }, [bookmarkTree, error]);

    return (
        <div className="bookmark-view">
            <BookmarkHeader
                onSearch={handleSearch}
                onCreateBookmark={handleCreateBookmark}
                onCreateFolder={handleCreateFolder}
                searchQuery={searchQuery}
            />

            {error && <div className="bookmark-error">Error: {error}</div>}

            {isLoading ? (
                <div className="bookmark-loading">Loading bookmarks...</div>
            ) : (
                <BookmarkTree
                    bookmarks={displayData}
                    expandedFolders={expandedFolders}
                    onToggleFolder={toggleFolder}
                    onUpdate={handleUpdateBookmark}
                    onDelete={handleDeleteBookmark}
                    onMove={handleMoveBookmark}
                    onOpenBookmark={(url: string) => {
                        if (url && chrome?.tabs) {
                            chrome.tabs.create({ url }).catch(error => {
                                console.error('Error opening bookmark:', error);
                            });
                        }
                    }}
                />
            )}

            {searchQuery.trim() && searchResults.length === 0 && !isSearching && (
                <div className="bookmark-empty">No bookmarks found matching &quot;{searchQuery}&quot;</div>
            )}

            {!searchQuery.trim() && bookmarkTree.length === 0 && (
                <div className="bookmark-empty">No bookmarks found. Start by creating a bookmark or folder!</div>
            )}
        </div>
    );
};

export default BookmarkView;
