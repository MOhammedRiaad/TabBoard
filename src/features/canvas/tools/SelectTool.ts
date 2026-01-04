import { BaseTool, ToolContext } from './Tool';
import { Point } from '../types/canvas';
import { findElementAtPoint } from '../utils/hitTest';

export class SelectTool extends BaseTool {
    type = 'select';
    private isDragging = false;
    private dragStart: Point | null = null;
    private isSelecting = false;
    private selectionStart: Point | null = null;

    onMouseDown(point: Point, context: ToolContext): void {
        const activeCanvas = context.store.getActiveCanvas();
        if (!activeCanvas) return;

        const clickedElement = findElementAtPoint(activeCanvas.elements, point);

        if (clickedElement) {
            // Element Clicked
            const isSelected = activeCanvas.selectedIds.includes(clickedElement.id);
            const isModifier = context.modifiers.ctrlKey || context.modifiers.metaKey;

            if (isModifier) {
                if (isSelected) {
                    // Deselect
                    const newIds = activeCanvas.selectedIds.filter(id => id !== clickedElement.id);
                    context.store.setSelectedIds(newIds);
                } else {
                    // Add to selection
                    context.store.setSelectedIds([...activeCanvas.selectedIds, clickedElement.id]);
                    this.isDragging = true;
                    this.dragStart = point;
                }
            } else {
                if (isSelected) {
                    // Already selected -> Prepare drag
                    this.isDragging = true;
                    this.dragStart = point;
                } else {
                    // Not selected -> Select it (replace)
                    context.store.setSelectedIds([clickedElement.id]);
                    this.isDragging = true;
                    this.dragStart = point;
                }
            }
        } else {
            // Empty space clicked -> Start marquee
            context.store.clearSelection();
            this.isSelecting = true;
            this.selectionStart = point;
            context.store.setSelectionBox({ start: point, end: point });
        }
    }

    onMouseMove(point: Point, context: ToolContext): void {
        const activeCanvas = context.store.getActiveCanvas();
        if (!activeCanvas) return;

        if (this.isDragging && this.dragStart && activeCanvas.selectedIds.length > 0) {
            const dx = point.x - this.dragStart.x;
            const dy = point.y - this.dragStart.y;

            activeCanvas.selectedIds.forEach(id => {
                const element = activeCanvas.elements.find(el => el.id === id);
                if (element) {
                    context.store.updateElement(id, {
                        x: element.x + dx,
                        y: element.y + dy,
                    });
                }
            });

            this.dragStart = point;
        } else if (this.isSelecting && this.selectionStart) {
            context.store.setSelectionBox({ start: this.selectionStart, end: point });
        }
    }

    onMouseUp(point: Point, context: ToolContext): void {
        const activeCanvas = context.store.getActiveCanvas();

        if (this.isSelecting && this.selectionStart && activeCanvas) {
            // Finalize marquee selection
            // We need logic to find elements inside the box.
            // This logic is likely in hitTest.ts as well? Or we implement it here.
            // Let's check hitTest.ts for 'getElementsInBox' or similar.

            // For now, assume simple box intersection (AABB)
            const minX = Math.min(this.selectionStart.x, point.x);
            const maxX = Math.max(this.selectionStart.x, point.x);
            const minY = Math.min(this.selectionStart.y, point.y);
            const maxY = Math.max(this.selectionStart.y, point.y);

            const selectedIds = activeCanvas.elements
                .filter(el => {
                    // Simple AABB check.
                    const elRight = el.x + el.width;
                    const elBottom = el.y + el.height;

                    // Intersection check:
                    return el.x < maxX && elRight > minX && el.y < maxY && elBottom > minY;
                })
                .map(el => el.id);

            context.store.setSelectedIds(selectedIds);
            context.store.setSelectionBox(null);
        }

        this.isDragging = false;
        this.dragStart = null;
        this.isSelecting = false;
        this.selectionStart = null;
    }
}
