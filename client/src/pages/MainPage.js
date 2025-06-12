import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import MainContainer from '../components/MainContainer';
import SecondaryContainer from '../components/SecondaryContainer';
import ModalWrapper from '../components/modal';
import NoteForm from '../components/NoteForm';
import NewContainerForm from '../components/NewContainerForm';
import '../index.css';
import logo from '../utils/Logo-Trece.png';
import DropdownMenu from '../components/DropdownMenu';
import switch_url from '../switch';

const MainPage = ({ onLogout, user, socket }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [mode, setMode] = useState("");
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [secondaryContainers, setSecondaryContainers] = useState([]);
  const [showNewContainerModal, setShowNewContainerModal] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateInputs, setShowDateInputs] = useState(false);
  const [selectedContainerId, setSelectedContainerId] = useState(null);

  const searchInputRef = useRef(null);

  const applyFilters = useCallback(() => {
    let filtered = notes;
  
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(note =>
        note.titulo.toLowerCase().includes(lowercasedTerm) ||
        note.contenido.toLowerCase().includes(lowercasedTerm)
      );
    }
  
    if (startDate) {
      const start = new Date(startDate);
      start.setDate(start.getDate() + 1);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(note => new Date(note.createdAt) >= start);
    }
  
    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(note => new Date(note.createdAt) < end);
    }
  
    setFilteredNotes(filtered);
  }, [notes, searchTerm, startDate, endDate]);
  

  useEffect(() => {
    loadNotes();
    loadContainers();

    socket.on('noteUpdated', () => {
      loadNotes();
      loadContainers();
    });

    return () => {
      socket.off('noteUpdated');
    };
  }, [socket]);


  useEffect(() => {
    applyFilters();
  }, [searchTerm, notes, startDate, endDate, applyFilters]);

  const loadNotes = () => {
    axios.get(`${switch_url}/api/notas`)
      .then(response => {
        const fetchedNotes = response.data.filter(note => !note.containerId);
        fetchedNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotes(fetchedNotes);
        setFilteredNotes(fetchedNotes);
      })
      .catch(error => console.error('Error al obtener las notas:', error));
  };
  

  const loadContainers = () => {
    axios.get(`${switch_url}/api/containers`)
      .then(response => {
        const sortedContainers = response.data.map(container => {
          const sortedItems = container.items.sort((a, b) => a.order - b.order);
          return { ...container, items: sortedItems };
        });
        setSecondaryContainers(sortedContainers);
      })
      .catch(error => console.error('Error al obtener los contenedores:', error));
  };
  

  const handleEdit = (note) => {
    setCurrentNote(note);
    setMode("edit");
    setShowModal(true);
  };

  const handleView = (note) => {
    setCurrentNote(note);
    setMode("view");
    setShowModal(true);
  };

  const handleSaveNote = (updatedOrNewNote, isNew = false) => {
    if (isNew) {
      setNotes((prevNotes) => [updatedOrNewNote, ...prevNotes]);
      setFilteredNotes((prevNotes) => [updatedOrNewNote, ...prevNotes]);
      loadContainers(); 
      loadNotes();
    } else {
      const noteId = updatedOrNewNote._id;
  
      if (!noteId) {
        console.error('noteId es undefined');
        toast.error('Error: El ID de la nota es undefined');
        return;
      }
  
      setNotes((prevNotes) => 
        prevNotes.map((note) =>
          note._id === noteId || note.originalNoteId === noteId
            ? updatedOrNewNote
            : note
        )
      );
  
      setFilteredNotes((prevFilteredNotes) =>
        prevFilteredNotes.map((note) =>
          note._id === noteId || note.originalNoteId === noteId
            ? updatedOrNewNote
            : note
        )
      );
  
      loadContainers();
      loadNotes();
    }
    setShowModal(false);
    setCurrentNote(null);
    toast.success('Nota guardada correctamente');
  };

  const handleCreateNote = () => {
    setCurrentNote(null);
    setMode("create");
    setShowModal(true);
  };

  const deleteNote = (id, containerId = null) => {
    const confirmation = window.confirm("¿Estás seguro de que deseas eliminar esta nota?");
    if (!confirmation) return;

    if (containerId) {
      axios.delete(`${switch_url}/api/containers/${containerId}/notes/${id}`)
        .then(() => {
          loadContainers();
          loadNotes();
          toast.success('Nota eliminada correctamente');
        })
        .catch(error => {
          console.error('Error al eliminar la nota:', error);
          toast.error('Error al eliminar la nota');
        });
    } else {
      axios.delete(`${switch_url}/api/notas/${id}`)
        .then(() => {
          setNotes(notes.filter(note => note._id !== id));
          toast.success('Nota eliminada correctamente');
        })
        .catch(error => {
          console.error('Error al eliminar la nota:', error);
          toast.error('Error al eliminar la nota');
        });
    }
  };

  const handleAddContainer = (containerName) => {
    axios.post(`${switch_url}/api/containers`, { name: containerName })
      .then(response => {
        setSecondaryContainers([...secondaryContainers, response.data]);
        setShowNewContainerModal(false);
        toast.success('Guion creado correctamente');
      })
      .catch(error => {
        console.error('Error al crear el Guion:', error);
        toast.error('Error al crear el Guion');
      });
  };

  const handleCreateCorte = (containerId) => {
    if (!containerId) {
      toast.error('Seleccione un contenedor para crear un corte.');
      return;
    }
    axios.post(`${switch_url}/api/cortes`, { containerId })
      .then(response => {
        const newCorte = response.data;
        setSecondaryContainers(prevContainers => {
          return prevContainers.map(container => {
            if (container._id === containerId) {
              return { ...container, items: [...container.items, { type: 'Corte', item: newCorte }] };
            }
            return container;
          });
        });
      })
      .catch(error => {
        console.error('Error al crear el corte:', error);
        toast.error('Error al crear el corte');
      });
  };

  const handleClick = useCallback((event, containerId) => {
    event.stopPropagation();
    setSelectedContainerId(containerId);
    console.log('Selected container ID:', containerId);
  }, []);
  

  const onReorderItem = useCallback((itemId, containerId, newIndex, itemType) => {
    if (containerId === null) {
      return;
    }
  
    setSecondaryContainers(prevContainers => {
      const containerIndex = prevContainers.findIndex(container => container._id === containerId);
      if (containerIndex === -1) {
        console.log('Container not found:', containerId);
        return prevContainers;
      }
      const container = prevContainers[containerIndex];
      const items = [...container.items];
  
      const itemIndex = items.findIndex(item => item.item._id === itemId && item.type === itemType);
      if (itemIndex === -1) {
        return prevContainers;
      }
  
      const [movedItem] = items.splice(itemIndex, 1);
      items.splice(newIndex, 0, movedItem);
  
      const reorderedItems = items.map((item, index) => ({ ...item, order: index }));
  
      const updatedContainer = { ...container, items: reorderedItems };
  
      clearTimeout(window.reorderTimeout);
      window.reorderTimeout = setTimeout(() => {
        axios.patch(`${switch_url}/api/containers/${containerId}/reorder`, { items: reorderedItems })
          .then(response => {
            console.log('Items reordered successfully');
          })
          .catch(error => {
            console.error('Error reordering items:', error);
          });
      }, 300);
  
      return [
        ...prevContainers.slice(0, containerIndex),
        updatedContainer,
        ...prevContainers.slice(containerIndex + 1),
      ];
    });
  }, []);
  
  

  
  const onDropNote = (noteId, containerId, dropIndex, itemType = 'Note') => {
    if (!containerId || containerId === null) {
      console.error('No reordering needed.');
      return;
    }
  
    const noteToCopy = itemType === 'Note' ? notes.find(note => note._id === noteId) : null;
  
    if (!noteToCopy) {
      console.log(`${itemType} not found for ID:`, noteId);
      return;
    }
  
    const newNote = {
      titulo: noteToCopy.titulo,
      contenido: noteToCopy.contenido,
      cintillos: noteToCopy.cintillos,
      createdAt: noteToCopy.createdAt,
      containerId: containerId,
      originalNoteId: itemType === 'Note' ? noteToCopy._id : null,
      reviewed: noteToCopy.reviewed,
      createdBy: noteToCopy.createdBy,
    };
  
    const url = itemType === 'Note' ? `${switch_url}/api/containers/${containerId}/notes` : `${switch_url}/api/containers/${containerId}/cortes`;
  
    axios.post(url, newNote)
      .then(response => {
        const addedNote = response.data;
        console.log(`${itemType} added successfully:`, addedNote);
        setSecondaryContainers(prevContainers => {
          const updatedContainers = prevContainers.map(container => {
            if (container._id === containerId) {
              const newItems = [...container.items];
              newItems.splice(dropIndex, 0, { type: itemType, item: addedNote });
  
              const reorderedItems = newItems.map((item, index) => ({
                ...item,
                item: { ...item.item, order: index }
              }));
  
              axios.patch(`${switch_url}/api/containers/${containerId}/reorder`, { items: reorderedItems })
                .then(response => {
                  console.log('Items reordered successfully in database', response.data);
                })
                .catch(error => {
                  console.error('Error reordering items in database:', error);
                });
  
              return { ...container, items: reorderedItems };
            }
            return container;
          });
          return updatedContainers;
        });
        toast.success(`${itemType} added successfully`);
      })
      .catch(error => {
        console.error(`Error adding ${itemType}:`, error);
        toast.error(`Error adding ${itemType}`);
      });
  };
  
  
  
  const handleDeleteContainer = (containerId) => {
    const confirmation = window.confirm("¿Estás seguro de que deseas eliminar este contenedor?");
    if (!confirmation) return;

    axios.delete(`${switch_url}/api/containers/${containerId}`)
      .then(() => {
        setSecondaryContainers(secondaryContainers.filter(container => container._id !== containerId));
        loadNotes();
        toast.success('Guion eliminado correctamente');
      })
      .catch(error => {
        console.error('Error al eliminar el guion:', error);
        toast.error('Error al eliminar el guion');
      });
  };

  const deleteCorte = (corteId, containerId) => {
    const confirmation = window.confirm("¿Estás seguro de que deseas eliminar este corte?");
    if (!confirmation) return;

    axios.delete(`${switch_url}/api/containers/${containerId}/cortes/${corteId}`)
      .then(() => {
        loadContainers();
        toast.success('Corte eliminado correctamente');
      })
      .catch(error => {
        console.error('Error al eliminar el corte:', error);
        toast.error('Error al eliminar el corte');
      });
  };

  const handleOpenNewContainerModal = () => {
    setShowNewContainerModal(true);
  };

  const handleContainerSelect = (containerId) => {
    setSelectedContainerId(containerId);
    console.log("Selected container ID:", selectedContainerId);
  };

  const handleEditContainerName = (id, newName) => {
    setSecondaryContainers(prevContainers =>
      prevContainers.map(container =>
        container._id === id ? { ...container, name: newName } : container
      )
    );
  };

  const handleSearchButtonClick = () => {
    setShowSearchInput(!showSearchInput);
    if (!showSearchInput) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 0);
    }
  };

  return (
    <div className="main-page">
      <header className="main-header">
        <div className="header-left">
          <div className="header-title">
            <img src={logo} alt="Logo" className="logo" draggable="false" />
            <h1 className="title">Trece Noticias - Gestor de Información</h1>
          </div>
        </div>
        <div className="header-right">
          <DropdownMenu onLogout={onLogout} user={user} />
        </div>
      </header>
  
      <div className="header-buttons">
        <button onClick={handleCreateNote} className="create-button">
          <i className="fas fa-plus"></i> Crear Nota
        </button>
        <button onClick={handleOpenNewContainerModal} className="create-button">
          <i className="fas fa-plus"></i> Crear Guión
        </button>
        <button onClick={handleSearchButtonClick} className="search-button">
          <i className="fas fa-search"></i>
        </button>
        <button onClick={() => setShowDateInputs(!showDateInputs)} className="calendar-button">
          <i className="fas fa-calendar-alt"></i>
        </button>
      </div>
  
      {showSearchInput && (
        <input
          type="text"
          ref={searchInputRef}
          placeholder="Buscar notas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      )}
      {showDateInputs && (
        <div className="date-filters">
          <div className="date-filter">
            <label>
              Fecha Inicio
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Fecha de inicio"
              />
            </label>
          </div>
          <div className="date-filter">
            <label>
              Fecha Final
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Fecha de fin"
              />
            </label>
          </div>
        </div>
      )}
  
      <section className="content">
        <div className="containers-wrapper">
          <MainContainer 
            notes={filteredNotes} 
            onEdit={handleEdit} 
            onView={handleView}
            onDelete={deleteNote}
            onDropNote={onDropNote} 
            onReorderItem={onReorderItem} 
          />
          {secondaryContainers.map(container => (
            <div key={container._id} onClick={(event) => handleClick(event, container._id)}>
              <SecondaryContainer
                id={container._id}
                name={container.name}
                items={container.items}
                onDropNote={onDropNote} 
                onReorderItem={onReorderItem}
                onDeleteContainer={handleDeleteContainer}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={(noteId) => deleteNote(noteId, container._id)}
                onSelect={handleContainerSelect}
                onAddCorte={handleCreateCorte}
                deleteNote={deleteNote} 
                deleteCorte={deleteCorte}
                onEditContainerName={handleEditContainerName} 
              />
            </div>
          ))}
        </div>
      </section>
  
      {showModal && (
        <ModalWrapper show={showModal} onClose={() => setShowModal(false)}>
          <NoteForm 
            note={currentNote} 
            mode={mode} 
            onSave={handleSaveNote} 
            onCancel={() => setShowModal(false)} 
            reloadContainers={loadContainers}
            user={user}
          />
        </ModalWrapper>
      )}
      {showNewContainerModal && (
        <ModalWrapper show={showNewContainerModal} onClose={() => setShowNewContainerModal(false)}>
          <NewContainerForm onAddContainer={handleAddContainer} />
        </ModalWrapper>
      )}
    </div>
  );
};

export default MainPage;
