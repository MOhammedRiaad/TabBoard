import React, { useEffect } from 'react';
import '../BoardView.css';

interface BoardToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onClose: () => void;
}

const BoardToast: React.FC<BoardToastProps> = ({ message, type = 'info', duration = 3000, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`board-toast board-toast-${type}`}>
            <span className="board-toast-message">{message}</span>
            <button className="board-toast-close" onClick={onClose} aria-label="Close">
                ×
            </button>
        </div>
    );
};

export default BoardToast;
