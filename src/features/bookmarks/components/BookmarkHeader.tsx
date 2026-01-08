import React, { useState } from 'react';
import '../BookmarkView.css';

interface BookmarkHeaderProps {
    onSearch: (query: string) => void;
    onCreateBookmark: (title: string, url: string, parentId?: string) => void;
    onCreateFolder: (title: string, parentId?: string) => void;
    searchQuery: string;
}

const BookmarkHeader: React.FC<BookmarkHeaderProps> = ({ onSearch, onCreateBookmark, onCreateFolder, searchQuery }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showFolderForm, setShowFolderForm] = useState(false);
    const [bookmarkTitle, setBookmarkTitle] = useState('');
    const [bookmarkUrl, setBookmarkUrl] = useState('');
    const [folderTitle, setFolderTitle] = useState('');

    const handleCreateBookmark = (e: React.FormEvent) => {
        e.preventDefault();
        if (bookmarkTitle.trim() && bookmarkUrl.trim()) {
            onCreateBookmark(bookmarkTitle.trim(), bookmarkUrl.trim());
            setBookmarkTitle('');
            setBookmarkUrl('');
            setShowAddForm(false);
        }
    };

    const handleCreateFolder = (e: React.FormEvent) => {
        e.preventDefault();
        if (folderTitle.trim()) {
            onCreateFolder(folderTitle.trim());
            setFolderTitle('');
            setShowFolderForm(false);
        }
    };

    return (
        <div className="bookmark-header">
            <h2>Bookmarks</h2>
            <div className="bookmark-header-actions">
                <div className="bookmark-search">
                    <input
                        type="text"
                        placeholder="Search bookmarks..."
                        value={searchQuery}
                        onChange={e => onSearch(e.target.value)}
                        className="bookmark-search-input"
                    />
                </div>
                <div className="bookmark-actions">
                    <button onClick={() => setShowAddForm(!showAddForm)} className="bookmark-btn">
                        ➕ Add Bookmark
                    </button>
                    <button onClick={() => setShowFolderForm(!showFolderForm)} className="bookmark-btn">
                        📁 Add Folder
                    </button>
                </div>
            </div>

            {showAddForm && (
                <form onSubmit={handleCreateBookmark} className="bookmark-form">
                    <input
                        type="text"
                        placeholder="Bookmark title"
                        value={bookmarkTitle}
                        onChange={e => setBookmarkTitle(e.target.value)}
                        className="bookmark-input"
                        required
                    />
                    <input
                        type="url"
                        placeholder="URL (e.g., https://example.com)"
                        value={bookmarkUrl}
                        onChange={e => setBookmarkUrl(e.target.value)}
                        className="bookmark-input"
                        required
                    />
                    <div className="bookmark-form-actions">
                        <button type="submit" className="bookmark-btn bookmark-btn-primary">
                            Create
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowAddForm(false);
                                setBookmarkTitle('');
                                setBookmarkUrl('');
                            }}
                            className="bookmark-btn"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {showFolderForm && (
                <form onSubmit={handleCreateFolder} className="bookmark-form">
                    <input
                        type="text"
                        placeholder="Folder name"
                        value={folderTitle}
                        onChange={e => setFolderTitle(e.target.value)}
                        className="bookmark-input"
                        required
                    />
                    <div className="bookmark-form-actions">
                        <button type="submit" className="bookmark-btn bookmark-btn-primary">
                            Create
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowFolderForm(false);
                                setFolderTitle('');
                            }}
                            className="bookmark-btn"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default BookmarkHeader;
