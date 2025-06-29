
import React, { useState, useEffect } from 'react';

function DolarModal({ show, onClose, containerId }) {
  const [tipoCambioCompra, setTipoCambioCompra] = useState('');
  const [tipoCambioVenta, setTipoCambioVenta] = useState('');
  const [fecha, setFecha] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Obtener último tipo de cambio si existe
    const fetchUltimo = async () => {
      try {
        const response = await fetch(`https://gestor-noticias-api.onrender.com/api/dolars/${containerId}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.compra && data.venta) {
            setTipoCambioCompra(data.compra);
            setTipoCambioVenta(data.venta);
          }
        }
      } catch (error) {
        console.error('Error al cargar tipo de cambio previo', error);
      }
    };

    if (show && containerId) {
      fetchUltimo();
    }
  }, [show, containerId]);

  const handleGuardar = async () => {
    if (!tipoCambioCompra || !tipoCambioVenta || !fecha) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      const response = await fetch('https://gestor-noticias-api.onrender.com/api/dolars/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ compra: tipoCambioCompra, venta: tipoCambioVenta, fecha, containerId }),
      });

      if (!response.ok) throw new Error('Error al guardar el tipo de cambio');

      setError('');
      onClose();
    } catch (err) {
      console.error(err);
      setError('Error al guardar el tipo de cambio');
    }
  };

  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Ingresar Tipo de Cambio</h2>

        <input
          type="text"
          placeholder="Tipo de cambio compra"
          value={tipoCambioCompra}
          onChange={(e) => setTipoCambioCompra(e.target.value)}
        />
        <input
          type="text"
          placeholder="Tipo de cambio venta"
          value={tipoCambioVenta}
          onChange={(e) => setTipoCambioVenta(e.target.value)}
        />
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
        {error && <p className="error">{error}</p>}

        <button className="btn btn-red" onClick={handleGuardar}>Guardar</button>
        <button className="btn btn-gray" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}

export default DolarModal;
