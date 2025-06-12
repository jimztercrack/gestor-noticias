const express = require('express');
const router = express.Router();
const Corte = require('../models/Corte');
const Container = require('../models/Container');

// Crear un nuevo corte
router.post('/', async (req, res) => {
  const { containerId } = req.body;

  const corte = new Corte();

  try {
    const nuevoCorte = await corte.save();
    const container = await Container.findById(containerId);
    container.items.push({ type: 'Corte', item: nuevoCorte._id });
    await container.save();
    res.status(201).json(nuevoCorte);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Eliminar un corte
router.delete('/:id', async (req, res) => {
  try {
    const corte = await Corte.findById(req.params.id);
    if (!corte) {
      return res.status(404).json({ message: "Corte no encontrado" });
    }

    const container = await Container.findOne({ 'items.item': corte._id });
    container.items = container.items.filter(item => item.item.toString() !== corte._id.toString());
    await container.save();

    await corte.deleteOne();
    res.json({ message: 'Corte eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
