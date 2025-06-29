
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const DolarModal = ({ showModal, setShowModal }) => {
  const [compra, setCompra] = useState('');
  const [venta, setVenta] = useState('');
  const [error, setError] = useState('');

  const handleClose = () => {
    setShowModal(false);
    setCompra('');
    setVenta('');
    setError('');
  };

  const handleSaveDolar = async () => {
    if (!compra || !venta) {
      setError('Debe ingresar ambos valores de compra y venta');
      return;
    }

    try {
      const response = await fetch('https://gestor-noticias-api.onrender.com/api/dolars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ compra, venta }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar el tipo de cambio');
      }

      alert('Tipo de cambio guardado correctamente');
      setShowModal(false);
    } catch (error) {
      console.error('Error al guardar:', error);
      setError(error.message);
    }
  };

  return (
    <Modal show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Tipo de Cambio</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formCompra">
            <Form.Label>Compra</Form.Label>
            <Form.Control
              type="number"
              value={compra}
              onChange={(e) => setCompra(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formVenta">
            <Form.Label>Venta</Form.Label>
            <Form.Control
              type="number"
              value={venta}
              onChange={(e) => setVenta(e.target.value)}
            />
          </Form.Group>
          {error && <p className="text-danger mt-2">{error}</p>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="success" onClick={handleSaveDolar}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DolarModal;
