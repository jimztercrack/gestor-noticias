import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import NoteView from '../components/NoteView'; // Importa el nuevo componente
import DropdownMenu from '../components/DropdownMenu'; // Importa el DropdownMenu
import '../index.css';
import '../styles/base.css';
import '../styles/buttons.css';
import '../styles/common.css';
import '../styles/MainPageEditor.css'; 
import logo from '../utils/Logo-Trece.png';
import switch_url from '../switch';

const MainPageEditor = ({ onLogout, user, socket }) => {
  const [currentNote, setCurrentNote] = useState(null);
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateInputs, setShowDateInputs] = useState(false);
  const [mode, setMode] = useState('');

  const searchInputRef = useRef(null);

  const applyFilters = useCallback(() => {
    let filtered = notes;

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(note =>
        note.titulo.toLowerCase().includes(lowercasedTerm)
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
  
    socket.on('noteUpdated', () => {
      loadNotes();
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
        const fetchedNotes = response.data.filter(note => !note.containerId && note.createdBy && note.createdBy.userId === user._id);
        fetchedNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotes(fetchedNotes);
        setFilteredNotes(fetchedNotes);
      })
      .catch(error => console.error('Error al obtener las notas:', error));
  };

  const handleView = (note) => {
    setCurrentNote(note);
    setMode("view");
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

  const handleSaveNote = (updatedOrNewNote, isNew = false) => {
    if (isNew) {
      setNotes((prevNotes) => [updatedOrNewNote, ...prevNotes]);
      setFilteredNotes((prevNotes) => [updatedOrNewNote, ...prevNotes]);
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
    }
    setCurrentNote(null);
    toast.success('Nota guardada correctamente');
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="main-page-editor main-page">
      <header className="main-header">
        <div className="header-left">
          <div className="header-title">
            <img src={logo} alt="Logo" className="logo" draggable="false" />
            <h1 className="title">Trece Noticias - Editor de Notas</h1>
          </div>
        </div>
        <div className="header-right">
          <DropdownMenu onLogout={onLogout} user={user} />
        </div>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <div className="header-buttons">
            <button className="search-button" onClick={handleSearchButtonClick}>
              <i className="fas fa-search"></i>
            </button>
            <button className="calendar-button" onClick={() => setShowDateInputs(!showDateInputs)}>
              <i className="fas fa-calendar-alt"></i>
            </button>
          </div>

          <div className="sidebar-content">
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

            <div className="notes-wrapper">
              {filteredNotes.map(note => (
                <div key={note._id} className="note-item" onClick={() => handleView(note)}>
                  <h3 className="note-title">{note.titulo}</h3>
                  <span className="note-date">{formatDate(note.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="note-content">
          {currentNote ? (
            <NoteView
              note={currentNote}
              onSave={handleSaveNote}
              onCancel={() => setCurrentNote(null)}
              reloadContainers={loadNotes}
              user={user}
            />
          ) : (
            <div className="placeholder">
              <h2>Seleccione una nota para verla aquí</h2>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MainPageEditor;
