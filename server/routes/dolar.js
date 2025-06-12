const express = require('express');
const router = express.Router();
const Dolar = require('../models/Dolar'); // Asegúrate de que el modelo Dolar esté definido

// Crear o actualizar un registro de dólar
router.post('/', async (req, res) => {
  try {
    // Buscar el último registro de dólar
    let latestDolar = await Dolar.findOne().sort({ createdAt: -1 });

    if (latestDolar) {
      // Actualizar el último registro de dólar
      latestDolar.compra = req.body.compra;
      latestDolar.venta = req.body.venta;
      const updatedDolar = await latestDolar.save();
      res.status(200).json(updatedDolar);
    } else {
      // Crear un nuevo registro de dólar
      const newDolar = new Dolar(req.body);
      const savedDolar = await newDolar.save();
      res.status(201).json(savedDolar);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener todos los registros de dólar
router.get('/', async (req, res) => {
  try {
    const dolars = await Dolar.find();
    res.status(200).json(dolars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
