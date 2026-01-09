import React, { useState } from 'react';
import { Folder, Tab } from '../../../types';
import BoardModal from './BoardModal';
import '../BoardView.css';

interface BoardHeaderProps {
    boardName: string;
    folders: Folder[];
    tabs: Tab[];
    searchQuery: string;
    onSearch: (query: string) => void;
    onCreateFolder: (data: { name: string; color: string }) => void;
    onCreateTab: (data: { title: string; url: string; folderId?: string }) => void;
    onShowHistory: () => void;
    isHistoryOpen: boolean;
    onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const BoardHeader: React.FC<BoardHeaderProps> = ({
    boardName,
    folders,
    searchQuery,
    onSearch,
    onCreateFolder,
    onCreateTab,
    onShowHistory,
    isHistoryOpen,
    onShowToast,
}) => {
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [showTabModal, setShowTabModal] = useState(false);

    return (
        <div className="board-header-modern">
            {/* Top Section: Title and Actions */}
            <div className="board-header-top">
                <div className="board-header-title-section">
                    <h2 className="board-title">{boardName}</h2>
                    <div className="board-stats">
                        <span className="board-stat-item">
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <rect x="2" y="2" width="12" height="12" rx="2" />
                            </svg>
                            {folders.length} {folders.length === 1 ? 'Folder' : 'Folders'}
                        </span>
                    </div>
                </div>
                <div className="board-view-actions">
                    <button
                        onClick={() => setShowTabModal(true)}
                        className="board-action-btn board-action-btn-primary"
                        title="Add a new tab"
                        aria-label="Add tab"
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M9 3v12M3 9h12" />
                        </svg>
                        <span>Add Tab</span>
                    </button>
                    <button
                        onClick={() => setShowFolderModal(true)}
                        className="board-action-btn"
                        title="Create a new folder"
                        aria-label="Create folder"
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M3 5h12M5 3v4M13 3v4M3 5v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5" />
                        </svg>
                        <span>New Folder</span>
                    </button>
                    <button
                        onClick={onShowHistory}
                        className={`board-action-btn ${isHistoryOpen ? 'active' : ''}`}
                        title={isHistoryOpen ? 'Close history panel' : 'Open history panel'}
                        aria-label={isHistoryOpen ? 'Close history' : 'Open history'}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="9" cy="9" r="7" />
                            <path d="M9 5v4l3 2" />
                        </svg>
                        <span>Show Browser History</span>
                    </button>
                </div>
            </div>

            {/* Modern Search Bar */}
            <div className="board-search-wrapper">
                <div className="board-search-modern">
                    <svg
                        className="board-search-icon"
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
                        placeholder="Search tabs and folders..."
                        value={searchQuery}
                        onChange={e => onSearch(e.target.value)}
                        className="board-search-input-modern"
                        autoComplete="off"
                        aria-label="Search tabs and folders"
                    />
                    {searchQuery && (
                        <button onClick={() => onSearch('')} className="board-search-clear" aria-label="Clear search">
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
                </div>
            </div>

            {/* Create Folder Modal */}
            <BoardModal
                isOpen={showFolderModal}
                onClose={() => setShowFolderModal(false)}
                mode="create"
                type="folder"
                folders={folders}
                onSubmit={data => {
                    if (data.name && data.color) {
                        onCreateFolder({ name: data.name, color: data.color });
                    }
                }}
                onShowToast={onShowToast}
            />

            {/* Create Tab Modal */}
            <BoardModal
                isOpen={showTabModal}
                onClose={() => setShowTabModal(false)}
                mode="create"
                type="tab"
                folders={folders}
                onSubmit={data => {
                    if (data.title && data.url) {
                        onCreateTab({
                            title: data.title,
                            url: data.url,
                            folderId: data.folderId,
                        });
                    }
                }}
                onShowToast={onShowToast}
            />
        </div>
    );
};

export default BoardHeader;
