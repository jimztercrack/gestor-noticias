// routes/containers.js
const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const Container = require('../models/Container');
const Note = require('../models/Note');
const Corte = require('../models/Corte');
const getContainer = require('../middlewares/getContainer');

// Middleware para obtener un contenedor por ID
router.use('/:id', getContainer);

// Obtener todos los contenedores
router.get('/', async (req, res) => {
  try {
    const containers = await Container.find().populate({
      path: 'items.item',
      populate: { path: 'containerId', model: 'Container' }  // Especificamos el modelo
    });
    res.json(containers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Crear un nuevo contenedor
router.post('/', [
  check('name').notEmpty().withMessage('El nombre es requerido')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const container = new Container({
    name: req.body.name,
    items: []
  });

  try {
    const newContainer = await container.save();
    res.status(201).json(newContainer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Actualizar el nombre del contenedor
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  Container.findByIdAndUpdate(id, { name }, { new: true })
    .then(updatedContainer => res.json(updatedContainer))
    .catch(err => res.status(500).json({ error: 'Error al actualizar el contenedor' }));
});

// Crear una nueva nota en un contenedor
router.post('/:containerId/notes', async (req, res) => {
  const { containerId } = req.params;
  const { titulo, contenido, cintillos, createdAt, originalNoteId, reviewed, createdBy } = req.body;

  const newNote = new Note({
    titulo,
    contenido,
    cintillos,
    createdAt,
    containerId,
    originalNoteId,
    reviewed,
    createdBy // Incluye el campo createdBy
  });

  try {
    const savedNote = await newNote.save();
    const container = await Container.findById(containerId);
    if (!container) {
      return res.status(404).json({ message: 'Contenedor no encontrado' });
    }
    console.log('Contenedor antes de la actualización:', container); // Verificar contenido del contenedor antes de actualizar
    container.items.push({ type: 'Note', item: savedNote._id });
    await container.save();
    console.log('Contenedor después de la actualización:', container); // Verificar contenido del contenedor después de actualizar
    res.status(201).json(savedNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Crear un nuevo corte en un contenedor
router.post('/:containerId/cortes', async (req, res) => {
  const { containerId } = req.params;

  const corte = new Corte({
    containerId: containerId
  });

  try {
    const newCorte = await corte.save();
    const container = await Container.findById(containerId);
    container.items.push({ type: 'Corte', item: newCorte._id });
    await container.save();
    res.status(201).json(newCorte);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Reordenar los elementos en un contenedor
router.patch('/:containerId/reorder', async (req, res) => {
  const { containerId } = req.params;
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ message: 'Invalid items format' });
  }

  try {
    console.log('Reordering items in container:', items);

    const mappedItems = items.map(item => ({ type: item.type, item: item.item, _id: item._id }));
    console.log('Mapped items:', mappedItems);

    // Actualizar el contenedor con los ítems reordenados
    const updatedContainer = await Container.findOneAndUpdate(
      { _id: containerId },
      { items: mappedItems },
      { new: true, runValidators: true, context: 'query' }
    ).populate({
      path: 'items.item',
      populate: { path: 'containerId', model: 'Container' }
    });

    if (!updatedContainer) {
      return res.status(404).json({ message: 'Contenedor no encontrado' });
    }

    console.log('Container after update:', updatedContainer);

    // Actualizar el orden en el modelo Note
    for (const item of items) {
      if (item.type === 'Note') {
        await Note.findByIdAndUpdate(item.item, { order: item.order });
      }
    }

    res.json(updatedContainer);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: err.message });
  }
});




// Eliminar una nota de un contenedor específico
router.delete('/:containerId/notes/:noteId', async (req, res) => {
  try {
    const { containerId, noteId } = req.params;

    // Remover la nota del contenedor
    await Container.updateOne({ _id: containerId }, { $pull: { items: { item: noteId, type: 'Note' } } });

    // Eliminar la nota
    await Note.findByIdAndDelete(noteId);

    res.json({ message: 'Nota eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Eliminar un corte de un contenedor específico
router.delete('/:containerId/cortes/:corteId', async (req, res) => {
  try {
    const { containerId, corteId } = req.params;

    // Remover el corte del contenedor
    await Container.updateOne({ _id: containerId }, { $pull: { items: { item: corteId, type: 'Corte' } } });

    // Eliminar el corte
    await Corte.findByIdAndDelete(corteId);

    res.json({ message: 'Corte eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Eliminar un contenedor específico
router.delete('/:containerId', async (req, res) => {
  try {
    const { containerId } = req.params;

    const container = await Container.findById(containerId);
    if (!container) {
      return res.status(404).json({ message: 'Contenedor no encontrado' });
    }

    // Eliminar todas las notas y cortes dentro del contenedor
    for (let item of container.items) {
      if (item.type === 'Note') {
        await Note.findByIdAndDelete(item.item);
      } else if (item.type === 'Corte') {
        await Corte.findByIdAndDelete(item.item);
      }
    }

    // Eliminar el contenedor
    await container.deleteOne();
    res.json({ message: 'Contenedor eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
