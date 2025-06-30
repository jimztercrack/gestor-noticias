import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import '../styles/dolarModal.css'; // Importa los estilos del modal
import switch_url from '../switch';

const DollarModal = ({ isOpen, onRequestClose, onSubmit }) => {
  const [compra, setCompra] = useState('');
  const [venta, setVenta] = useState('');
  const [lastDolar, setLastDolar] = useState(null);

  useEffect(() => {
    if (isOpen) {
      axios.get(`${switch_url}/api/dolars`)
        .then(response => {
          const dolars = response.data;
          if (dolars.length > 0) {
            setLastDolar(dolars[dolars.length - 1]);
            setCompra(dolars[dolars.length - 1].compra);
            setVenta(dolars[dolars.length - 1].venta);
          } else {
            console.log('No dolar data found');
          }
        })
        .catch(error => {
          console.error('Error fetching last dolar data:', error);
        });
    } else {
      console.log('Modal is not open');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting new dolar data:', { compra, venta });
    axios.post(`${switch_url}/api/dolars`, { compra, venta })
      .then(response => {
        console.log('Dolar data saved:', response.data);
        onSubmit(compra, venta);
      })
      .catch(error => {
        console.error('Error saving dolar data:', error);
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
    >
      <h2>Tipo de Cambio</h2>
      {lastDolar && (
        <div className="last-dolar-info">
          <p><strong>Último Dato Registrado:</strong></p>
          <p>Compra: {lastDolar.compra}</p>
          <p>Venta: {lastDolar.venta}</p>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label>
          Compra:
          <input
            value={compra}
            onChange={(e) => setCompra(e.target.value)}
            required
          />
        </label>
        <label>
          Venta:
          <input
            value={venta}
            onChange={(e) => setVenta(e.target.value)}
            required
          />
        </label>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button type="submit">Guardar</button>
          <button type="button" onClick={onRequestClose}>Cancelar</button>
        </div>
      </form>
    </Modal>
  );
};

export default DollarModal;
