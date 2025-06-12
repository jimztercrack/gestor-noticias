import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import '../styles/cortes.css';

const Corte = ({ corte, index, containerId, onReorderItem, onDelete, onDropNote, className }) => {
  const [, drag] = useDrag({
    type: 'Corte',
    item: { type: 'Corte', id: corte._id, index, containerId },
  });

  const [, drop] = useDrop({
    accept: ['Note', 'Corte'],
    hover(item) {
      if (item.id !== corte._id) {
        onReorderItem(item.id, containerId, index, item.type); // Permitir reordenar cualquier tipo de elemento
        item.index = index;
      }
    },
    drop: (item, monitor) => {
      if (!monitor.didDrop() && (item.type === 'Note' || item.type === 'Corte')) {
        const dropResult = monitor.getDropResult();
        const newContainerId = dropResult ? dropResult.containerId : containerId;
        const newIndex = dropResult && dropResult.index !== undefined ? dropResult.index : index;

        onDropNote && onDropNote(item.id, newContainerId, newIndex, item.type); // Manejar el drop para ambos tipos
      }
      return { containerId };
    },
  });

  return (
    <div ref={(node) => drag(drop(node))} className={`corte ${className}`}>
      <div className="divider">
        <span className="divider-text">CORTE COMERCIAL</span>
        <button onClick={() => onDelete(corte._id)} className="delete-icon">
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </div>
  );
};

export default Corte;
