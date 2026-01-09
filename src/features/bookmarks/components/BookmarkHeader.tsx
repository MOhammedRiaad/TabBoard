import React, { useState } from 'react';
import { Bookmark } from '../../../types';
import { SortConfig } from '../utils/sortUtils';
import { FilterConfig } from '../utils/filterUtils';
import BookmarkModal from './BookmarkModal';
import BookmarkSortControls from './BookmarkSortControls';
import BookmarkFilterControls from './BookmarkFilterControls';
import '../BookmarkView.css';

interface BookmarkHeaderProps {
    onSearch: (query: string) => void;
    onCreateBookmark: (title: string, url: string, parentId?: string) => void;
    onCreateFolder: (title: string, parentId?: string) => void;
    searchQuery: string;
    onExpandAll?: () => void;
    onCollapseAll?: () => void;
    hasFolders?: boolean;
    folders?: Bookmark[];
    onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
    sortConfig: SortConfig;
    onSortChange: (config: SortConfig) => void;
    filterConfig: FilterConfig;
    onFilterChange: (config: FilterConfig) => void;
    viewMode: 'list' | 'grid';
    onViewModeChange: (mode: 'list' | 'grid') => void;
}

const BookmarkHeader: React.FC<BookmarkHeaderProps> = ({
    onSearch,
    onCreateBookmark,
    onCreateFolder,
    searchQuery,
    onExpandAll,
    onCollapseAll,
    hasFolders,
    folders = [],
    onShowToast,
    sortConfig,
    onSortChange,
    filterConfig,
    onFilterChange,
    viewMode,
    onViewModeChange,
}) => {
    const [showBookmarkModal, setShowBookmarkModal] = useState(false);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [showFiltersSort, setShowFiltersSort] = useState(false);

    const handleBookmarkSubmit = (data: { title: string; url?: string; parentId?: string }) => {
        if (data.url) {
            onCreateBookmark(data.title, data.url, data.parentId);
        }
    };

    const handleFolderSubmit = (data: { title: string; url?: string; parentId?: string }) => {
        onCreateFolder(data.title, data.parentId);
    };

    const hasActiveFilters =
        filterConfig.type !== 'all' || filterConfig.folderId !== undefined || filterConfig.domain !== undefined;
    const hasActiveSort = sortConfig.criteria !== 'default';

    return (
        <div className="bookmark-header">
            {/* Modern Header with Title */}
            <div className="bookmark-header-top">
                <div className="bookmark-header-title-section">
                    <h2 className="bookmark-title">Bookmarks</h2>
                    {hasFolders && (
                        <div className="bookmark-view-actions">
                            <button
                                onClick={onExpandAll}
                                className="bookmark-icon-btn"
                                title="Expand all folders"
                                aria-label="Expand all folders"
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M4 6l4 4 4-4" />
                                </svg>
                            </button>
                            <button
                                onClick={onCollapseAll}
                                className="bookmark-icon-btn"
                                title="Collapse all folders"
                                aria-label="Collapse all folders"
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M4 10l4-4 4 4" />
                                </svg>
                            </button>
                        </div>
                    )}
                    {/* View Toggle Buttons */}
                    <button
                        onClick={() => onViewModeChange('grid')}
                        className={`bookmark-icon-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        title="Grid view"
                        aria-label="Switch to grid view"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <rect x="2" y="2" width="5" height="5" rx="1" />
                            <rect x="9" y="2" width="5" height="5" rx="1" />
                            <rect x="2" y="9" width="5" height="5" rx="1" />
                            <rect x="9" y="9" width="5" height="5" rx="1" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onViewModeChange('list')}
                        className={`bookmark-icon-btn ${viewMode === 'list' ? 'active' : ''}`}
                        title="List view"
                        aria-label="Switch to list view"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M3 4h10M3 8h10M3 12h10" />
                        </svg>
                    </button>
                </div>
                <button
                    onClick={() => setShowBookmarkModal(true)}
                    className="bookmark-fab"
                    title="Add a new bookmark"
                    aria-label="Add bookmark"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M10 4v12M4 10h12" />
                    </svg>
                    <span className="bookmark-fab-text">Add</span>
                </button>
            </div>

            {/* Modern Search Bar */}
            <div className="bookmark-search-wrapper">
                <div className="bookmark-search-modern">
                    <svg
                        className="bookmark-search-icon"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="9" cy="9" r="6" />
                        <path d="m15 15-3-3" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search bookmarks..."
                        value={searchQuery}
                        onChange={e => onSearch(e.target.value)}
                        className="bookmark-search-input-modern"
                        autoComplete="off"
                        aria-label="Search bookmarks"
                        aria-describedby="search-hint"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearch('')}
                            className="bookmark-search-clear"
                            aria-label="Clear search"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M12 4L4 12M4 4l8 8" />
                            </svg>
                        </button>
                    )}
                    <span id="search-hint" className="sr-only">
                        Press Ctrl+F to focus search, or start typing to search
                    </span>
                </div>
            </div>

            {/* Modern Quick Actions Bar */}
            <div className="bookmark-quick-actions">
                <button
                    onClick={() => setShowFolderModal(true)}
                    className="bookmark-quick-action-btn"
                    title="Create a new folder"
                    aria-label="Create folder"
                >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h12M6 3v12" />
                    </svg>
                    <span>New Folder</span>
                </button>
                <button
                    onClick={() => setShowFiltersSort(!showFiltersSort)}
                    className={`bookmark-quick-action-btn ${showFiltersSort ? 'active' : ''}`}
                    aria-expanded={showFiltersSort}
                    aria-label={showFiltersSort ? 'Hide filters and sort' : 'Show filters and sort'}
                >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="4" cy="4" r="1.5" />
                        <circle cx="14" cy="4" r="1.5" />
                        <circle cx="4" cy="14" r="1.5" />
                        <circle cx="14" cy="14" r="1.5" />
                        <path d="M4 9h10M9 4v10" />
                    </svg>
                    <span>Filters & Sort</span>
                    {(hasActiveFilters || hasActiveSort) && (
                        <span className="bookmark-quick-action-badge">
                            {(hasActiveFilters ? 1 : 0) + (hasActiveSort ? 1 : 0)}
                        </span>
                    )}
                </button>
            </div>

            {/* Modern Filters & Sort Panel */}
            {showFiltersSort && (
                <div className="bookmark-controls-panel">
                    <div className="bookmark-controls-panel-content">
                        <div className="bookmark-controls-section-modern">
                            <div className="bookmark-controls-section-header">
                                <h3 className="bookmark-controls-section-title">Filters</h3>
                                {hasActiveFilters && (
                                    <button
                                        onClick={() => {
                                            onFilterChange({ type: 'all', folderId: undefined, domain: undefined });
                                        }}
                                        className="bookmark-controls-reset"
                                        aria-label="Clear all filters"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            <BookmarkFilterControls
                                filterConfig={filterConfig}
                                onFilterChange={onFilterChange}
                                folders={folders}
                            />
                        </div>

                        <div className="bookmark-controls-section-modern">
                            <div className="bookmark-controls-section-header">
                                <h3 className="bookmark-controls-section-title">Sort</h3>
                                {hasActiveSort && (
                                    <button
                                        onClick={() => {
                                            onSortChange({ criteria: 'default', order: 'asc' });
                                        }}
                                        className="bookmark-controls-reset"
                                        aria-label="Reset sort to default"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                            <BookmarkSortControls sortConfig={sortConfig} onSortChange={onSortChange} />
                        </div>
                    </div>
                </div>
            )}

            {/* Create Bookmark Modal */}
            <BookmarkModal
                isOpen={showBookmarkModal}
                onClose={() => setShowBookmarkModal(false)}
                mode="create"
                isFolder={false}
                folders={folders}
                onSubmit={handleBookmarkSubmit}
                onShowToast={onShowToast}
            />

            {/* Create Folder Modal */}
            <BookmarkModal
                isOpen={showFolderModal}
                onClose={() => setShowFolderModal(false)}
                mode="create"
                isFolder={true}
                folders={folders}
                onSubmit={handleFolderSubmit}
                onShowToast={onShowToast}
            />
        </div>
    );
};

export default BookmarkHeader;
