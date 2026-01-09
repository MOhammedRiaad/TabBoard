import React from 'react';
import { Bookmark } from '../../../types';
import { FilterConfig, FilterType } from '../utils/filterUtils';
import { getAllDomains } from '../utils/domainUtils';
import '../BookmarkView.css';

interface BookmarkFilterControlsProps {
    filterConfig: FilterConfig;
    onFilterChange: (config: FilterConfig) => void;
    folders: Bookmark[];
}

/**
 * BookmarkFilterControls Component
 *
 * Provides UI controls for filtering bookmarks by type and folder.
 * Follows modern design patterns with clear visual feedback.
 */
const BookmarkFilterControls: React.FC<BookmarkFilterControlsProps> = ({ filterConfig, onFilterChange, folders }) => {
    const handleTypeChange = (type: FilterType) => {
        onFilterChange({
            ...filterConfig,
            type,
            // Reset folder filter when changing type to avoid confusion
            folderId: type === 'all' ? undefined : filterConfig.folderId,
        });
    };

    const handleFolderChange = (folderId: string) => {
        onFilterChange({
            ...filterConfig,
            folderId: folderId === '' ? undefined : folderId,
        });
    };

    const handleDomainChange = (domain: string) => {
        onFilterChange({
            ...filterConfig,
            domain: domain === '' ? undefined : domain,
        });
    };

    // Get all folders for the dropdown (excluding root folders)
    // Helper to recursively collect all folders
    const getAllFoldersRecursive = (items: Bookmark[]): Bookmark[] => {
        const result: Bookmark[] = [];
        items.forEach(item => {
            // Check if it's a folder (no URL) and not a root folder
            if (!item.url && item.id !== '0' && item.id !== '1' && item.id !== '2') {
                result.push(item);
            }
            // Recursively get folders from children
            if (item.children && item.children.length > 0) {
                result.push(...getAllFoldersRecursive(item.children));
            }
        });
        return result;
    };

    const availableFolders = getAllFoldersRecursive(folders);

    // Get all unique domains from bookmarks
    const availableDomains = getAllDomains(folders);

    return (
        <div className="bookmark-filter-controls">
            <div className="bookmark-filter-group">
                <label htmlFor="bookmark-filter-type" className="bookmark-filter-label">
                    Type:
                </label>
                <select
                    id="bookmark-filter-type"
                    value={filterConfig.type}
                    onChange={e => handleTypeChange(e.target.value as FilterType)}
                    className="bookmark-filter-select"
                    aria-label="Filter bookmarks by type"
                >
                    <option value="all">All</option>
                    <option value="bookmarks">Bookmarks</option>
                    <option value="folders">Folders</option>
                </select>
            </div>

            <div className="bookmark-filter-group">
                <label htmlFor="bookmark-filter-folder" className="bookmark-filter-label">
                    Folder:
                </label>
                <select
                    id="bookmark-filter-folder"
                    value={filterConfig.folderId || ''}
                    onChange={e => handleFolderChange(e.target.value)}
                    className="bookmark-filter-select"
                    aria-label="Filter bookmarks by folder"
                    disabled={filterConfig.type === 'folders'}
                >
                    <option value="">All Folders</option>
                    {availableFolders.map(folder => (
                        <option key={folder.id} value={folder.id}>
                            {folder.title || 'Untitled Folder'}
                        </option>
                    ))}
                </select>
            </div>

            <div className="bookmark-filter-group">
                <label htmlFor="bookmark-filter-domain" className="bookmark-filter-label">
                    Domain:
                </label>
                <select
                    id="bookmark-filter-domain"
                    value={filterConfig.domain || ''}
                    onChange={e => handleDomainChange(e.target.value)}
                    className="bookmark-filter-select"
                    aria-label="Filter bookmarks by domain"
                    disabled={filterConfig.type === 'folders'}
                >
                    <option value="">All Domains</option>
                    {availableDomains.map(domain => (
                        <option key={domain} value={domain}>
                            {domain}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default BookmarkFilterControls;
