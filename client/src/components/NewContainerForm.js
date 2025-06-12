// NewContainerForm.js
import React, { useState, useEffect, useRef } from 'react';

const NewContainerForm = ({ onAddContainer }) => {
  const [containerName, setContainerName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    // Enfocar el input cuando se muestre el formulario
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault(); // Evita la recarga de la página
    onAddContainer(containerName); // Llama a la función pasada como prop con el nombre del contenedor
    setContainerName(''); // Limpia el campo de texto después de enviar
  };


return (
  <form className="new-container-form" onSubmit={handleSubmit}>
    <div className="form-group">
      <label htmlFor="name">Crear Guion:</label>
      <input
        ref={inputRef} // Añadir la referencia al input
        type="text"
        id="name"
        value={containerName}
        onChange={(e) => setContainerName(e.target.value)}
        required
      />
    </div>
    <div className="buttons-area">
      <button type="submit">Crear</button>
    </div>
  </form>
);
};

export default NewContainerForm;
