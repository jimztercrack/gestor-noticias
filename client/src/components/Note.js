import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

const Note = ({ note, index, containerId, onReorderItem, onView, onDelete, onDropNote, isSecondary, className = '' }) => {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'Note',
    item: { type: 'Note', id: note._id, index, containerId, isMainToSecondary: !isSecondary },
    end: async (draggedItem, monitor) => {
      if (!monitor.didDrop()) {
        console.log('Drag ended but item was not dropped.');
        return;
      }
      try {
        const dropResult = monitor.getDropResult();
        const newContainerId = dropResult ? dropResult.containerId : containerId;

        if (newContainerId === null || !newContainerId) {
          console.log('Note dropped in MainContainer or invalid container, no reordering needed.');
          return;
        }
      } catch (err) {
        console.error('Error al reordenar el contenedor:', err);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ['Note', 'Corte'],
    drop: (item, monitor) => {
      if (!monitor.didDrop() && (item.type === 'Note' || item.type === 'Corte')) {
        const dropResult = monitor.getDropResult();
        const newContainerId = dropResult ? dropResult.containerId : containerId;
        const newIndex = dropResult && dropResult.index !== undefined ? dropResult.index : index;

        onDropNote && onDropNote(item.id, newContainerId, newIndex, item.type);
      }
      return { containerId };
    },
    hover(item, monitor) {
      if (!ref.current) return;

      const hoverIndex = index;
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (item.index < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (item.index > hoverIndex && hoverClientY > hoverMiddleY) return;

      onReorderItem(item.id, containerId, hoverIndex, item.type);
      item.index = hoverIndex;
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  });

  drag(drop(ref));

  const noteColor = isSecondary
    ? (note.reviewed ? '#d9ead3' : '#f4cccc')
    : ''; // Color por defecto para el contenedor principal

  return (
    <div ref={ref} className={`note ${isSecondary ? 'secondary-note' : ''} ${isOver ? 'is-over' : ''} ${className}`} style={{ backgroundColor: noteColor }} onDoubleClick={() => onView(note)}>
      <div className="note-header">
        <h3>{note.titulo}</h3>
        <span className="note-date">{new Date(note.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
        <button className="delete-button" onClick={() => onDelete(note._id)}>
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </div>
  );
};

export default Note;
