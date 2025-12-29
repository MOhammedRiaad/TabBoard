import React, { useEffect, useRef } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useBoardStore } from '../store/boardStore';
import FolderColumn from './FolderColumn';
import AddFolderForm from './AddFolderForm';
import './BoardView.css';

const BoardView: React.FC = () => {
  const { boards, folders, tabs, moveTab, addBoard } = useBoardStore();
  const hasCreatedDefaultBoard = useRef(false);

  // Create a default board if none exists
  const currentBoard = boards.length > 0 ? boards[0] : {
    id: 'default_board',
    name: 'My Board',
    color: '#3b82f6',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  useEffect(() => {
    // Only create default board once, and only if no boards exist
    if (boards.length === 0 && !hasCreatedDefaultBoard.current) {
      hasCreatedDefaultBoard.current = true;
      addBoard({
        id: 'default_board',
        name: 'My Board',
        color: '#3b82f6'
      });
    }
    // Reset the flag if boards are manually deleted
    if (boards.length > 0) {
      hasCreatedDefaultBoard.current = false;
    }
  }, [boards.length, addBoard]);
  
  const boardFolders = folders.filter(folder => folder.boardId === currentBoard.id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Check if the drop target is a folder
      const targetFolder = folders.find(f => f.id === over.id);
      
      if (targetFolder) {
        // Move tab to the target folder
        moveTab(active.id as string, targetFolder.id);
        
        // Notify background script
        chrome.runtime.sendMessage({
          type: 'MOVE_TAB',
          payload: {
            tabId: active.id,
            newFolderId: targetFolder.id
          }
        });
      }
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="board-view">
        <div className="board-header">
          <h2>{currentBoard?.name || 'Default Board'}</h2>
        </div>
        <div className="folders-container">
          {boardFolders.map(folder => (
            <FolderColumn 
              key={folder.id} 
              folder={folder} 
              tabs={tabs.filter(tab => tab.folderId === folder.id)} 
            />
          ))}
          <AddFolderForm boardId={currentBoard?.id} />
        </div>
      </div>
    </DndContext>
  );
};

export default BoardView;