import React from 'react';
import Note from './Note';
import { useDrop } from 'react-dnd';

const MainContainer = ({ notes, onEdit, onView, onDelete, onReorderItem }) => {
  const [, drop] = useDrop({
    accept: 'ITEM',
    canDrop: () => false, // Evita que se suelten notas en este contenedor
  });

  return (
    <div ref={drop} className="main-container">
      {notes.length === 0 ? (
        <div className="empty-main-message">No hay notas para mostrar</div>
      ) : (
        notes.map((note, index) => (
          <Note 
            key={note._id}
            note={note}
            index={index}
            containerId={null}
            onEdit={onEdit}
            onView={onView}
            onDelete={onDelete}
            onReorderItem={onReorderItem}
          />
        ))
      )}
    </div>
  );
};

export default MainContainer;
