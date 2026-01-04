import { StateCreator } from 'zustand';
import { CanvasElement } from '../../types/canvas';
import { CanvasStoreState, ElementSlice } from '../types';

export const createElementSlice: StateCreator<CanvasStoreState, [], [], ElementSlice> = (set, get) => ({
    addElement: element => {
        const { activeCanvasId, canvases } = get();
        if (!activeCanvasId) return;

        // Save history first
        const currentCanvas = canvases.find(c => c.canvasId === activeCanvasId);
        if (currentCanvas) {
            get().saveHistory(activeCanvasId, [...currentCanvas.elements]);
        }

        set(state => ({
            canvases: state.canvases.map(canvas =>
                canvas.canvasId === state.activeCanvasId
                    ? {
                          ...canvas,
                          elements: [...canvas.elements, element],
                          updatedAt: Date.now(),
                      }
                    : canvas
            ),
        }));

        get().saveToStorage();
    },

    updateElement: (id, updates) => {
        set(state => ({
            canvases: state.canvases.map(canvas =>
                canvas.canvasId === state.activeCanvasId
                    ? {
                          ...canvas,
                          elements: canvas.elements.map(el =>
                              el.id === id ? ({ ...el, ...updates, updatedAt: Date.now() } as CanvasElement) : el
                          ),
                          updatedAt: Date.now(),
                      }
                    : canvas
            ),
        }));
        get().saveToStorage();
    },

    deleteElement: id => {
        const { activeCanvasId, canvases } = get();
        if (!activeCanvasId) return;

        const currentCanvas = canvases.find(c => c.canvasId === activeCanvasId);
        if (currentCanvas) {
            get().saveHistory(activeCanvasId, [...currentCanvas.elements]);
        }

        set(state => ({
            canvases: state.canvases.map(canvas =>
                canvas.canvasId === state.activeCanvasId
                    ? {
                          ...canvas,
                          elements: canvas.elements.filter(el => el.id !== id),
                          selectedIds: canvas.selectedIds.filter(sid => sid !== id),
                          updatedAt: Date.now(),
                      }
                    : canvas
            ),
        }));
        get().saveToStorage();
    },

    deleteElements: ids => {
        const { activeCanvasId, canvases } = get();
        if (!activeCanvasId) return;

        const currentCanvas = canvases.find(c => c.canvasId === activeCanvasId);
        if (currentCanvas) {
            get().saveHistory(activeCanvasId, [...currentCanvas.elements]);
        }

        set(state => ({
            canvases: state.canvases.map(canvas =>
                canvas.canvasId === state.activeCanvasId
                    ? {
                          ...canvas,
                          elements: canvas.elements.filter(el => !ids.includes(el.id)),
                          selectedIds: [],
                          updatedAt: Date.now(),
                      }
                    : canvas
            ),
        }));
        get().saveToStorage();
    },

    bringToFront: ids => {
        set(state => ({
            canvases: state.canvases.map(canvas =>
                canvas.canvasId === state.activeCanvasId
                    ? {
                          ...canvas,
                          elements: [
                              ...canvas.elements.filter(el => !ids.includes(el.id)),
                              ...canvas.elements.filter(el => ids.includes(el.id)),
                          ],
                          updatedAt: Date.now(),
                      }
                    : canvas
            ),
        }));
        get().saveToStorage();
    },

    sendToBack: ids => {
        set(state => ({
            canvases: state.canvases.map(canvas =>
                canvas.canvasId === state.activeCanvasId
                    ? {
                          ...canvas,
                          elements: [
                              ...canvas.elements.filter(el => ids.includes(el.id)),
                              ...canvas.elements.filter(el => !ids.includes(el.id)),
                          ],
                          updatedAt: Date.now(),
                      }
                    : canvas
            ),
        }));
        get().saveToStorage();
    },

    bringForward: ids => {
        set(state => ({
            canvases: state.canvases.map(canvas => {
                if (canvas.canvasId !== state.activeCanvasId) return canvas;
                const elements = [...canvas.elements];
                ids.forEach(id => {
                    const index = elements.findIndex(el => el.id === id);
                    if (index < elements.length - 1) {
                        [elements[index], elements[index + 1]] = [elements[index + 1], elements[index]];
                    }
                });
                return { ...canvas, elements, updatedAt: Date.now() };
            }),
        }));
        get().saveToStorage();
    },

    sendBackward: ids => {
        set(state => ({
            canvases: state.canvases.map(canvas => {
                if (canvas.canvasId !== state.activeCanvasId) return canvas;
                const elements = [...canvas.elements];
                [...ids].reverse().forEach(id => {
                    const index = elements.findIndex(el => el.id === id);
                    if (index > 0) {
                        [elements[index], elements[index - 1]] = [elements[index - 1], elements[index]];
                    }
                });
                return { ...canvas, elements, updatedAt: Date.now() };
            }),
        }));
        get().saveToStorage();
    },
});
