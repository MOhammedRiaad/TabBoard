import { BaseTool, ToolContext } from './Tool';
import { Point, TextElement } from '../types/canvas';

export class TextTool extends BaseTool {
    type = 'text';

    onMouseDown(point: Point, context: ToolContext): void {
        // For now, we still use prompt. In a real app we'd overlay an input element.
        const text = prompt('Enter text:');
        if (text && text.trim()) {
            const textElement: TextElement = {
                id: `element-${Date.now()}`,
                type: 'text',
                x: point.x,
                y: point.y,
                width: text.length * (context.store.settings.defaultFontSize * 0.6), // Approximate width based on font size
                height: context.store.settings.defaultFontSize * 1.5, // Height based on font size
                rotation: 0,
                text: text.trim(),
                fontSize: context.store.settings.defaultFontSize,
                fontFamily: 'Arial',
                textAlign: 'left',
                style: {
                    strokeColor: context.store.settings.defaultTextColor,
                    fillColor: 'transparent',
                    strokeWidth: 1,
                    strokeStyle: 'solid',
                    opacity: 1,
                },
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            context.store.addElement(textElement);
        }

        // Reset tool to select after text entry
        context.store.setActiveTool('select');
    }

    onMouseMove(_point: Point, _context: ToolContext): void {
        // Text tool doesn't do anything on mouse move
    }

    onMouseUp(_point: Point, _context: ToolContext): void {
        // Text creation happens on mouse down
    }
}
