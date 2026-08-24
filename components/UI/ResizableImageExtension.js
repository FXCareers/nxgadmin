'use client';

import Image from '@tiptap/extension-image';

// Extends the base image node with a `width` attribute and a drag-to-resize
// handle, so images dropped into the editor can be sized freely instead of
// always rendering at their natural/full width.
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { style: `width: ${attributes.width}px` };
        },
        parseHTML: (element) => {
          const width = element.style.width || element.getAttribute('width');
          return width ? parseInt(width, 10) : null;
        },
      },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const container = document.createElement('div');
      container.style.position = 'relative';
      container.style.display = 'inline-block';
      container.style.maxWidth = '100%';
      container.style.lineHeight = '0';

      const img = document.createElement('img');
      img.src = node.attrs.src;
      if (node.attrs.alt) img.alt = node.attrs.alt;
      if (node.attrs.title) img.title = node.attrs.title;
      img.style.display = 'block';
      img.style.width = node.attrs.width ? `${node.attrs.width}px` : '100%';
      img.style.maxWidth = '100%';
      img.style.borderRadius = '0.5rem';

      const handle = document.createElement('div');
      handle.contentEditable = 'false';
      handle.style.cssText = `
        position: absolute; right: -6px; bottom: -6px; width: 14px; height: 14px;
        background: rgb(var(--primary-color-rgb)); border: 2px solid white;
        border-radius: 50%; cursor: nwse-resize; display: none; z-index: 10;
      `;

      const label = document.createElement('div');
      label.style.cssText = `
        position: absolute; bottom: 6px; right: 6px; padding: 2px 6px;
        background: rgba(0,0,0,0.65); color: #fff; font-size: 11px;
        border-radius: 4px; display: none; pointer-events: none; z-index: 10;
      `;

      container.append(img, handle, label);

      const setSelected = (selected) => {
        handle.style.display = selected && editor.isEditable ? 'block' : 'none';
        container.style.outline = selected ? '3px solid rgb(var(--primary-color-rgb))' : 'none';
        container.style.outlineOffset = selected ? '2px' : '0';
      };

      let startX = 0;
      let startWidth = 0;

      const onPointerMove = (event) => {
        const newWidth = Math.max(60, Math.round(startWidth + (event.clientX - startX)));
        img.style.width = `${newWidth}px`;
        label.textContent = `${newWidth}px`;
      };

      const onPointerUp = () => {
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        label.style.display = 'none';
        const newWidth = parseInt(img.style.width, 10);
        if (typeof getPos === 'function') {
          editor.chain().setNodeSelection(getPos()).updateAttributes('image', { width: newWidth }).run();
        }
      };

      handle.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        event.stopPropagation();
        startX = event.clientX;
        startWidth = img.offsetWidth;
        label.style.display = 'block';
        label.textContent = `${startWidth}px`;
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
      });

      return {
        dom: container,
        update(updatedNode) {
          if (updatedNode.type.name !== 'image') return false;
          img.src = updatedNode.attrs.src;
          img.style.width = updatedNode.attrs.width ? `${updatedNode.attrs.width}px` : '100%';
          return true;
        },
        selectNode() {
          setSelected(true);
        },
        deselectNode() {
          setSelected(false);
        },
        stopEvent(event) {
          return event.target === handle;
        },
        ignoreMutation() {
          return true;
        },
        destroy() {
          document.removeEventListener('pointermove', onPointerMove);
          document.removeEventListener('pointerup', onPointerUp);
        },
      };
    };
  },
});

export default ResizableImage;
