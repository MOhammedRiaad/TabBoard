import React, { useState } from 'react';
import { Bookmark } from '../../../types';
import '../BookmarkView.css';

interface BookmarkNodeProps {
    bookmark: Bookmark;
    isFolder: boolean;
    isExpanded: boolean;
    hasChildren: boolean;
    level: number;
    onToggleFolder: () => void;
    onUpdate: (id: string, changes: { title?: string; url?: string }) => void;
    onDelete: (id: string, isFolder: boolean) => void;
    onMove: (id: string, destination: { parentId?: string; index?: number }) => void;
    onOpenBookmark: (url: string) => void;
}

const BookmarkNode: React.FC<BookmarkNodeProps> = ({
    bookmark,
    isFolder,
    isExpanded,
    hasChildren,
    level,
    onToggleFolder,
    onUpdate,
    onDelete,
    onMove: _onMove, // Reserved for future drag-and-drop functionality
    onOpenBookmark,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(bookmark.title);
    const [editUrl, setEditUrl] = useState(bookmark.url || '');
    const [showMenu, setShowMenu] = useState(false);

    const handleEdit = () => {
        setIsEditing(true);
        setShowMenu(false);
    };

    const handleSave = () => {
        if (editTitle.trim()) {
            onUpdate(bookmark.id, {
                title: editTitle.trim(),
                url: isFolder ? undefined : editUrl.trim(),
            });
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setEditTitle(bookmark.title);
        setEditUrl(bookmark.url || '');
        setIsEditing(false);
    };

    const handleClick = () => {
        if (isFolder) {
            onToggleFolder();
        } else if (bookmark.url) {
            onOpenBookmark(bookmark.url);
        }
    };

    return (
        <div
            className={`bookmark-node ${isFolder ? 'bookmark-folder' : 'bookmark-item'}`}
            style={{ paddingLeft: `${level * 10}px` }}
        >
            <div className="bookmark-node-content">
                {isEditing ? (
                    <div className="bookmark-edit-form">
                        <input
                            type="text"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="bookmark-edit-input"
                            placeholder="Title"
                            autoFocus
                        />
                        {!isFolder && (
                            <input
                                type="url"
                                value={editUrl}
                                onChange={e => setEditUrl(e.target.value)}
                                className="bookmark-edit-input"
                                placeholder="URL"
                            />
                        )}
                        <div className="bookmark-edit-actions">
                            <button onClick={handleSave} className="bookmark-btn-small bookmark-btn-primary">
                                Save
                            </button>
                            <button onClick={handleCancel} className="bookmark-btn-small">
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bookmark-node-main" onClick={handleClick}>
                            {isFolder ? (
                                <span className="bookmark-icon">{isExpanded ? '📂' : '📁'}</span>
                            ) : (
                                <span className="bookmark-icon">🔖</span>
                            )}
                            <div className="bookmark-node-info">
                                <span className="bookmark-title">{bookmark.title}</span>
                                {!isFolder && bookmark.url && (
                                    <span className="bookmark-url" title={bookmark.url}>
                                        {bookmark.url.length > 50
                                            ? `${bookmark.url.substring(0, 50)}...`
                                            : bookmark.url}
                                    </span>
                                )}
                            </div>
                            {hasChildren && (
                                <span className="bookmark-children-count">({bookmark.children?.length || 0})</span>
                            )}
                        </div>
                        <div className="bookmark-node-actions">
                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                                className="bookmark-menu-btn"
                                title="More options"
                            >
                                ⋮
                            </button>
                            {showMenu && (
                                <div className="bookmark-menu">
                                    <button onClick={handleEdit} className="bookmark-menu-item">
                                        ✏️ Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            onDelete(bookmark.id, isFolder);
                                            setShowMenu(false);
                                        }}
                                        className="bookmark-menu-item bookmark-menu-item-danger"
                                    >
                                        🗑️ Delete
                                    </button>
                                    {bookmark.url && (
                                        <button
                                            onClick={() => {
                                                onOpenBookmark(bookmark.url!);
                                                setShowMenu(false);
                                            }}
                                            className="bookmark-menu-item"
                                        >
                                            🔗 Open
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BookmarkNode;
