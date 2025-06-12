import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Modal from './modal';
import { toast } from 'react-toastify';
import "../styles/form.css";
import '../App';
import switch_url from '../switch';

const NoteForm = ({ note, mode, onSave, onCancel, reloadContainers, user }) => {
  const [titulo, setTitle] = useState('');
  const [contenido, setContent] = useState('');
  const [cintillos, setCintillos] = useState([]);
  const [isEditing, setIsEditing] = useState(mode !== 'view');
  const [reviewed, setReviewed] = useState(false);
  const [createdBy, setCreatedBy] = useState({ firstName: '', lastName: '' });
  const [errors, setErrors] = useState({});
  const nameInputRef = useRef(null);
  const infoInputRef = useRef(null);
  const newNameCintilloAdded = useRef(false);
  const newInfoCintilloAdded = useRef(false);
  const contentRef = useRef(null);
  const titleRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    if (note) {
      setTitle(note.titulo.toUpperCase());
      setContent(note.contenido.toUpperCase());
      setCintillos(note.cintillos || []);
      setReviewed(note.reviewed || false);
      if (note.createdBy) {
        setCreatedBy({
          firstName: note.createdBy.firstName,
          lastName: note.createdBy.lastName,
        });
      } else {
        setCreatedBy({
          firstName: user.firstName,
          lastName: user.lastName,
        });
      }
    } else {
      setCreatedBy({
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }
  }, [note, user]);

  useEffect(() => {
    if (newNameCintilloAdded.current && nameInputRef.current) {
      nameInputRef.current.focus();
      newNameCintilloAdded.current = false;
    }
  }, [cintillos]);

  useEffect(() => {
    if (newInfoCintilloAdded.current && infoInputRef.current) {
      infoInputRef.current.focus();
      newInfoCintilloAdded.current = false;
    }
  }, [cintillos]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${switch_url}/api/users`);
        setAllUsers(response.data);
      } catch (error) {
        console.error('Error al cargar los usuarios:', error);
      }
    };
  
    if (user.role === 'admin') {
      fetchUsers();
    }
  }, [user.role]);

  const handleTitleChange = (e) => {
    const { selectionStart, selectionEnd } = titleRef.current;
    const value = e.target.value.toUpperCase();
    setTitle(value);
    setTimeout(() => {
      titleRef.current.setSelectionRange(selectionStart, selectionEnd);
    }, 0);
  };

  const handleContentChange = (e) => {
    const target = e.target;
    const value = target.value.toUpperCase();
    const scrollTop = target.scrollTop;
    const selectionStart = target.selectionStart;
    const selectionEnd = target.selectionEnd;
    
    setContent(value);

    requestAnimationFrame(() => {
      target.scrollTop = scrollTop;
      target.setSelectionRange(selectionStart, selectionEnd);
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);  // Bloquear el formulario
  
    const newErrors = {};
    cintillos.forEach((cintillo, index) => {
      if (cintillo.tipo === 'Nombre' && cintillo.nombre.length > 35) {
        newErrors[`nombre-${index}`] = 'El nombre no puede tener más de 35 caracteres';
        toast.error('El nombre no puede tener más de 35 caracteres');
      }
      if (cintillo.tipo === 'Nombre' && cintillo.cargo.length > 35) {
        newErrors[`cargo-${index}`] = 'El cargo no puede tener más de 35 caracteres';
        toast.error('El cargo no puede tener más de 35 caracteres');
      }
      if (cintillo.tipo === 'Informativo' && cintillo.informacion.length > 95) {
        newErrors[`informacion-${index}`] = 'La información no puede tener más de 95 caracteres';
        toast.error('La información no puede tener más de 95 caracteres');
      }
    });
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSaving(false);  // Desbloquear el formulario si hay errores
      return;
    }
  
    let userId;
    if (user.role === 'admin') {
      const selectedUser = allUsers.find(u => `${u.firstName} ${u.lastName}` === `${createdBy.firstName} ${createdBy.lastName}`);
      if (selectedUser) {
        userId = selectedUser._id;
      } else {
        console.error('Usuario no encontrado');
        toast.error('Usuario no encontrado');
        setIsSaving(false);
        return;
      }
    } else {
      userId = user._id;
    }
  
    const notaData = { 
      titulo, 
      contenido, 
      cintillos: cintillos.map(c => ({ ...c })), 
      reviewed,
      createdBy: {
        firstName: createdBy.firstName,
        lastName: createdBy.lastName,
        userId: userId
      }
    };
  
    console.log('Datos de la nota antes de guardar:', notaData);
  
    try {
      let response;
      if (note && note._id) {
        // Actualizar una nota existente
        console.log('Actualizando nota con ID:', note._id);
        response = await axios.patch(`${switch_url}/api/notas/${note._id}`, notaData);
        onSave({ ...notaData, _id: note._id }, false);
        reloadContainers();
      } else {
        // Crear una nueva nota
        response = await axios.post(`${switch_url}/api/notas`, notaData);
        notaData._id = response.data._id;
        onSave(notaData, true);
        reloadContainers();
      }
      onCancel();
    } catch (error) {
      console.error('Error al guardar la nota:', error);
    } finally {
      setIsSaving(false);  // Desbloquear el formulario después de guardar
    }
  };
  

  const handleAddCintillo = (tipo) => {
    const nuevoCintillo = tipo === 'Nombre' ? { tipo, nombre: '', cargo: '' } : { tipo, informacion: '' };
    setCintillos((prevCintillos) => [...prevCintillos, nuevoCintillo]);
    if (tipo === 'Nombre') {
      newNameCintilloAdded.current = true;
    } else if (tipo === 'Informativo') {
      newInfoCintilloAdded.current = true;
    }
  };

  const handleRemoveCintillo = (index) => {
    const nuevosCintillos = [...cintillos];
    nuevosCintillos.splice(index, 1);
    setCintillos(nuevosCintillos);
  };

  const handleChangeCintillo = (index, campo, valor) => {
    if (campo === 'nombre' && valor.length > 35) {
      toast.error('El nombre no puede tener más de 35 caracteres');
      return;
    }
    if (campo === 'cargo' && valor.length > 35) {
      toast.error('El cargo no puede tener más de 35 caracteres');
      return;
    }
    if (campo === 'informacion' && valor.length > 95) {
      toast.error('La información no puede tener más de 95 caracteres');
      return;
    }

    const nuevosCintillos = [...cintillos];
    nuevosCintillos[index][campo] = valor;
    setCintillos(nuevosCintillos);
  };

  return (
    <Modal show={true} onClose={onCancel} title={
      <>
        Vista de Nota
        {!isEditing && (
          <button
            type="button"
            className="edit-icon"
            onClick={handleEdit}
            style={{
              marginLeft: '10px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: 'red',
              fontSize: '1em',
            }}
            disabled={isSaving}  // Deshabilitar durante el guardado
          >
            <i className="fas fa-edit"></i>
          </button>
        )}
      </>
    }>
      <div className="revisado">
  <span>Creado por:&nbsp;
    {user.role === 'admin' ? (
      <select
      value={`${createdBy.firstName} ${createdBy.lastName}`}
      onChange={(e) => {
        const selectedUser = allUsers.find(u => `${u.firstName} ${u.lastName}` === e.target.value);
        if (selectedUser) {
          setCreatedBy({ firstName: selectedUser.firstName, lastName: selectedUser.lastName });
        } else {
          console.error('Usuario no encontrado');
          toast.error('Usuario no encontrado');
        }
      }}
      disabled={!isEditing}
    >
      {allUsers.map((u) => (
        <option key={u._id} value={`${u.firstName} ${u.lastName}`}>
          {u.firstName} {u.lastName}
        </option>
      ))}
    </select>
    ) : (
      `${createdBy.firstName} ${createdBy.lastName}`
    )}
  </span>
  <label>
    Revisado:&nbsp; 
    <input
      type="checkbox"
      checked={reviewed}
      onChange={(e) => setReviewed(e.target.checked)}
      disabled={!isEditing}
    />
  </label>
</div>

      {isSaving && <div className="saving-label">Guardando...</div>}
      <form onSubmit={handleSubmit} className="note-form">
        <div className="form-group">
          <label htmlFor="titulo">Título</label>
          <input
            id="titulo"
            ref={titleRef}
            type="text"
            value={titulo}
            onChange={handleTitleChange}
            placeholder="Título de la nota"
            disabled={!isEditing || isSaving}
            spellCheck={true}
            lang="es"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="contenido">Contenido</label>
          <textarea
            id="contenido"
            ref={contentRef}
            value={contenido}
            onChange={handleContentChange}
            placeholder="Contenido de la nota"
            disabled={!isEditing || isSaving}
            spellCheck={true}
            lang="es"
            required
          />
        </div>
        <div className="cintillos-area">
          {cintillos.map((cintillo, index) => (
            <div key={index} className="cintillo-item">
              {cintillo.tipo === 'Nombre' ? (
                <>
                  <input
                    type="text"
                    value={cintillo.nombre}
                    onChange={e => handleChangeCintillo(index, 'nombre', e.target.value)}
                    placeholder="Nombre"
                    maxLength={35}
                    disabled={!isEditing || isSaving}
                    spellCheck={true}
                    lang="es"
                    required
                    ref={(el) => {
                      if (index === cintillos.length - 1) {
                        nameInputRef.current = el;
                      }
                    }}
                    style={{ width: '35%' }}
                  />
                  {errors[`nombre-${index}`] && <span className="error">{errors[`nombre-${index}`]}</span>}
                  <input
                    type="text"
                    value={cintillo.cargo}
                    onChange={e => handleChangeCintillo(index, 'cargo', e.target.value)}
                    placeholder="Cargo"
                    maxLength={35}
                    disabled={!isEditing || isSaving}
                    spellCheck={true}
                    lang="es"
                    required
                    style={{ width: '35%' }}
                  />
                  {errors[`cargo-${index}`] && <span className="error">{errors[`cargo-${index}`]}</span>}
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={cintillo.informacion}
                    onChange={e => handleChangeCintillo(index, 'informacion', e.target.value)}
                    placeholder="Información"
                    maxLength={95}
                    disabled={!isEditing || isSaving}
                    spellCheck={true}
                    lang="es"
                    required
                    ref={(el) => {
                      if (index === cintillos.length - 1) {
                        infoInputRef.current = el;
                      }
                    }}
                    style={{ width: '75%' }}
                  />
                  {errors[`informacion-${index}`] && <span className="error">{errors[`informacion-${index}`]}</span>}
                </>
              )}
              {isEditing && (
                <button type="button" className="remove-button" onClick={() => handleRemoveCintillo(index)} disabled={isSaving}>
                  <i className="fas fa-trash"></i>
                </button>
              )}
            </div>
          ))}
        </div>
        {isEditing && (
          <div className="buttons-area">
            <button type="button" className="add-button" onClick={() => handleAddCintillo('Nombre')} disabled={isSaving}>Agregar Cintillo Nombre</button>
            <button type="button" className="add-button" onClick={() => handleAddCintillo('Informativo')} disabled={isSaving}>Agregar Cintillo Informativo</button>
            <button type="submit" className="save-button" disabled={isSaving}>Guardar</button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default NoteForm;
