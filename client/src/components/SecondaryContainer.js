import React, { useState, useEffect, useRef } from 'react';
import { useDrop } from 'react-dnd';
import axios from 'axios';
import Note from './Note';
import Corte from './Corte';
import switch_url from '../switch';
import { exportToWord } from '../utils/exportToWord';
import { exportTablaToWord } from '../utils/exportTablaToWord';
import { exportCintillosToExcel } from '../utils/exportToExcel';
import DollarModal from '../utils/dolarModal';

const SecondaryContainer = ({
  id,
  name,
  items = [],
  onDropNote,
  onReorderItem,
  onDeleteContainer,
  onEditContainerName,
  onEdit,
  onView,
  onDelete,
  onSelect,
  onAddCorte,
  deleteCorte
}) => {
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: ['Note', 'Corte'],
    hover(item, monitor) {
      if (item.type !== 'Note' && item.type !== 'Corte') return;

      const dragIndex = item.index;
      const hoverIndex = items.findIndex(i => i.item && i.item._id === item.id);

      if (dragIndex === hoverIndex) return;

      onReorderItem(item.id, id, hoverIndex, item.type);
      item.index = hoverIndex;
    },
    drop: (item, monitor) => {
      if (!monitor.didDrop() && (item.type === 'Note' || item.type === 'Corte')) {
        const hoverIndex = items.length;
        onDropNote(item.id, id, hoverIndex);
      }
      return { containerId: id };
    },
  });

  const [menuVisible, setMenuVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(name);
  const [isDollarModalOpen, setDollarModalOpen] = useState(false);

  const menuRef = useRef(null);

  const handleMenuToggle = () => {
    setMenuVisible(!menuVisible);
  };

  const handleEditName = () => {
    axios.put(`${switch_url}/api/containers/${id}`, { name: newName })
      .then(response => {
        onEditContainerName(id, newName);
        setIsEditing(false);
        setMenuVisible(false);
      })
      .catch(error => {
        console.error('Error al actualizar el nombre del contenedor:', error);
      });
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const openDollarModal = () => setDollarModalOpen(true);
  const closeDollarModal = () => setDollarModalOpen(false);

  const handleDollarSubmit = (compra, venta) => {
    axios.post(`${switch_url}/api/dolars`, { compra, venta, containerId: id })
      .then(response => {
        console.log('Dolar info added:', response.data);
        closeDollarModal();
      })
      .catch(error => {
        console.error('Error adding dolar info:', error);
      });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  const validItems = items.filter(item => item && item.item && item.item._id);

  const handleExportTabla = () => {
    exportTablaToWord(name, items);
  };

  return (
    <div ref={drop} className="secondary-container" onClick={() => onSelect(id)}>
      <div className="container-header">
        <h3>{name}</h3>
        <button onClick={openDollarModal} className="dollar-button">$</button>
        <i className="fas fa-ellipsis-v menu-icon" onClick={handleMenuToggle}></i>
        {menuVisible && (
          <div className="container-menu" ref={menuRef}>
            <button onClick={startEditing}>
              <i className="fas fa-pen"></i> Editar
            </button>
            <button onClick={() => onDeleteContainer(id)}>
              <i className="fas fa-trash"></i> Eliminar
            </button>
          </div>
        )}
      </div>
      {isEditing && (
  <div className="edit-container">
    <div className="edit-container-name">
      <input
        type="text"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder="Nuevo nombre"
      />
    </div>
    <button onClick={handleEditName}>Guardar</button>
  </div>
)}
      {validItems.length === 0 ? (
        <div className="empty-message">Arrastre aquí sus notas</div>
      ) : (
        validItems.map((item, index) => (
          item.type === 'Note' ? (
            <Note 
              key={item.item._id || index}
              note={item.item}
              index={index}
              containerId={id}
              onReorderItem={onReorderItem}
              onEdit={onEdit}
              onView={onView}
              onDelete={onDelete}
              onDropNote={onDropNote}
              className={`${index === items.length - 1 ? 'last-item' : ''}`}
              isSecondary={true}
            />
          ) : (
            <Corte
              key={item.item._id || index}
              corte={item.item}
              index={index}
              containerId={id}
              onReorderItem={onReorderItem}
              onDropNote={onDropNote}
              onDelete={() => deleteCorte(item.item._id, id)}
              className={`${index === items.length - 1 ? 'last-item' : ''}`}
            />
          )
        ))
      )}
      <div className="buttons-container">
        <button onClick={() => onAddCorte(id)}>Corte</button>
        <button onClick={handleExportTabla}>Exportar Tabla</button>
        <button onClick={() => exportToWord({ id, name, items })}>Exportar Guion</button>
        <button onClick={() => exportCintillosToExcel(items.filter(item => item.type === 'Note').map(item => item.item), name)}>Exportar Cintillos</button>
      </div>
      {isDollarModalOpen && (
        <DollarModal
          isOpen={isDollarModalOpen}
          onRequestClose={closeDollarModal}
          onSubmit={handleDollarSubmit}
        />
      )}
    </div>
  );
};

export default SecondaryContainer;
