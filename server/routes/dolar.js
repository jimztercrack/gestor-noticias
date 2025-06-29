const express = require('express');
const router = express.Router();
const Dolar = require('../models/Dolar');

// Ruta para guardar o actualizar el tipo de cambio de un container específico
router.post('/guardar', async (req, res) => {
  const { compra, venta, containerId } = req.body;

  if (!compra || !venta || !containerId) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios: compra, venta y containerId.' });
  }

  try {
    // Verificar si ya existe un tipo de cambio para ese container
    let tipoCambio = await Dolar.findOne({ containerId });

    if (tipoCambio) {
      // Si existe, se actualiza
      tipoCambio.compra = compra;
      tipoCambio.venta = venta;
      await tipoCambio.save();
    } else {
      // Si no existe, se crea uno nuevo
      tipoCambio = new Dolar({ compra, venta, containerId });
      await tipoCambio.save();
    }

    res.status(200).json({ message: 'Tipo de cambio guardado correctamente', data: tipoCambio });
  } catch (error) {
    console.error('Error al guardar el tipo de cambio:', error);
    res.status(500).json({ message: 'Error al guardar el tipo de cambio', error });
  }
});

// Ruta para obtener el tipo de cambio de un container
router.get('/:containerId', async (req, res) => {
  try {
    const tipoCambio = await Dolar.findOne({ containerId: req.params.containerId });
    if (!tipoCambio) {
      return res.status(404).json({ message: 'No se encontró tipo de cambio para este container' });
    }
    res.json(tipoCambio);
  } catch (error) {
    console.error('Error al obtener el tipo de cambio:', error);
    res.status(500).json({ message: 'Error al obtener el tipo de cambio' });
  }
});

module.exports = router;
