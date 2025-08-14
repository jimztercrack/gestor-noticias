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

// ===================== Helpers defensivos =====================
const clampIndex = (idx, length) => {
  const n = Number.isFinite(idx) ? idx : length;
  return Math.max(0, Math.min(n, length));
};

const sanitizeContainer = (c = {}) => {
  const items = Array.isArray(c.items) ? c.items : [];
  const clean = items
    .filter(e => e && e.type && e.item && e.item._id) // quita nulos/corruptos
    .sort((a, b) => {
      // si no hay order, fallback por estabilidad
      const ao = Number.isFinite(a.order) ? a.order : 0;
      const bo = Number.isFinite(b.order) ? b.order : 0;
      return ao - bo;
    })
    .map((e, idx) => ({
      ...e,
      order: Number.isFinite(e.order) ? e.order : idx, // normaliza order
    }));

  return { ...c, items: clean };
};

const sanitizeAll = (arr = []) => (Array.isArray(arr) ? arr.map(sanitizeContainer) : []);

// =============================================================

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
        (note.titulo || '').toLowerCase().includes(lowercasedTerm) ||
        (note.contenido || '').toLowerCase().includes(lowercasedTerm)
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
        const fetchedNotes = (response.data || [])
          .filter(note => !note.containerId);
        fetchedNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotes(fetchedNotes);
        setFilteredNotes(fetchedNotes);
      })
      .catch(error => console.error('Error al obtener las notas:', error));
  };

  const loadContainers = () => {
    axios.get(`${switch_url}/api/containers`)
      .then(response => {
        const clean = sanitizeAll(response.data || []);
        setSecondaryContainers(clean);
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
      const noteId = updatedOrNewNote?._id;

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
          setNotes(prev => prev.filter(note => note._id !== id));
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
        setSecondaryContainers(prev => sanitizeAll([...prev, response.data]));
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
          const next = prevContainers.map(container => {
            if (container._id === containerId) {
              const items = Array.isArray(container.items) ? [...container.items] : [];
              items.push({ type: 'Corte', item: newCorte, order: items.length });
              return sanitizeContainer({ ...container, items });
            }
            return container;
          });
          return next;
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
    if (!containerId) return;

    setSecondaryContainers(prevContainers => {
      const ci = prevContainers.findIndex(c => c._id === containerId);
      if (ci === -1) return prevContainers;

      const container = prevContainers[ci];
      const items = Array.isArray(container.items) ? [...container.items] : [];

      const from = items.findIndex(x => x && x.type === itemType && x.item && x.item._id === itemId);
      if (from === -1) return prevContainers;

      const [moved] = items.splice(from, 1);
      if (!moved || !moved.item) return prevContainers;

      const safeIndex = clampIndex(newIndex, items.length); // después de remover
      items.splice(safeIndex, 0, moved);

      const reorderedItems = items.map((it, idx) => ({ ...it, order: idx }));

      const updatedContainer = sanitizeContainer({ ...container, items: reorderedItems });

      clearTimeout(window.reorderTimeout);
      window.reorderTimeout = setTimeout(() => {
        axios.patch(`${switch_url}/api/containers/${containerId}/reorder`, { items: reorderedItems })
          .then(() => console.log('Items reordered successfully'))
          .catch(err => console.error('Error reordering items:', err));
      }, 300);

      return [
        ...prevContainers.slice(0, ci),
        updatedContainer,
        ...prevContainers.slice(ci + 1),
      ];
    });
  }, []);

  const onDropNote = (noteId, containerId, dropIndex, itemType = 'Note') => {
    if (!containerId) {
      console.error('No reordering needed.');
      return;
    }

    const noteToCopy = itemType === 'Note' ? notes.find(note => note._id === noteId) : null;
    if (itemType === 'Note' && !noteToCopy) {
      console.log(`${itemType} not found for ID:`, noteId);
      return;
    }

    const newNote = itemType === 'Note'
      ? {
          titulo: noteToCopy.titulo,
          contenido: noteToCopy.contenido,
          cintillos: noteToCopy.cintillos,
          createdAt: noteToCopy.createdAt,
          containerId: containerId,
          originalNoteId: noteToCopy._id,
          reviewed: noteToCopy.reviewed,
          createdBy: noteToCopy.createdBy,
        }
      : { containerId };

    const url = itemType === 'Note'
      ? `${switch_url}/api/containers/${containerId}/notes`
      : `${switch_url}/api/containers/${containerId}/cortes`;

    axios.post(url, newNote)
      .then(response => {
        const added = response.data;
        setSecondaryContainers(prevContainers => {
          const next = prevContainers.map(container => {
            if (container._id !== containerId) return container;

            const items = Array.isArray(container.items) ? [...container.items] : [];
            const safeIndex = clampIndex(dropIndex, items.length);
            items.splice(safeIndex, 0, { type: itemType, item: added });

            // Consistencia: order top-level
            const reordered = items.map((it, idx) => ({ ...it, order: idx }));

            // Persistir orden (best-effort, no bloquea UI)
            axios.patch(`${switch_url}/api/containers/${containerId}/reorder`, { items: reordered })
              .then(res => console.log('Items reordered successfully in database', res.data))
              .catch(err => console.error('Error reordering items in database:', err));

            return sanitizeContainer({ ...container, items: reordered });
          });
          return next;
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
        setSecondaryContainers(prev => prev.filter(container => container._id !== containerId));
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
    console.log("Selected container ID:", containerId);
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
        <button onClick={() => setShowDateInputs(
