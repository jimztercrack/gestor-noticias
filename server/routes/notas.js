const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Note = require('../models/Note');
const Container = require('../models/Container');
const getNota = require('../middlewares/getNota');

// Middleware para obtener una nota por ID
router.use('/:id', getNota);

// Obtener todas las notas
router.get('/', async (req, res) => {
  try {
    const notas = await Note.find();
    res.json(notas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtener una nota específica
router.get('/:id', (req, res) => {
  res.json(res.nota);
});

// Crear una nueva nota
router.post('/', [
  check('titulo').notEmpty().withMessage('El título es requerido'),
  check('contenido').notEmpty().withMessage('El contenido es requerido')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { titulo, contenido, cintillos, order, reviewed, createdBy } = req.body;

  const nota = new Note({
    titulo,
    contenido,
    cintillos,
    order: order || 0,
    reviewed: reviewed || false,
    createdBy: {
      firstName: createdBy.firstName,
      lastName: createdBy.lastName,
      userId: createdBy.userId
    }
  });

  try {
    const nuevaNota = await nota.save();
    const io = req.app.get('io');  // Obtener io desde app
    io.emit('noteUpdated');  // Emitir evento
    res.status(201).json(nuevaNota);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Ruta para actualizar una nota
router.patch('/:id', [
  check('titulo').optional().notEmpty().withMessage('El título no puede estar vacío'),
  check('contenido').optional().notEmpty().withMessage('El contenido no puede estar vacío')
], async (req, res) => {
  console.log('--- Inicio de la solicitud PATCH ---');

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Errores de validación:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const noteId = req.params.id;
    console.log('ID de la nota a actualizar:', noteId);

    const updatedData = req.body;
    console.log('Datos actualizados recibidos:', updatedData);

    // Eliminar el campo '_id' de los datos actualizados
    delete updatedData._id;

    // Buscar la nota original
    const originalNote = await Note.findById(noteId);
    if (!originalNote) {
      console.log('Nota original no encontrada.');
      return res.status(404).send("No se encontró la nota para actualizar.");
    }

    // Determinar los criterios de actualización
    const updateCriteria = originalNote.originalNoteId ? 
      { $or: [{ _id: originalNote.originalNoteId }, { originalNoteId: originalNote.originalNoteId }] } :
      { $or: [{ _id: noteId }, { originalNoteId: noteId }] };

    console.log('Criterios de actualización:', updateCriteria);

    // Actualizar todas las notas con el mismo ID original o ID
    const result = await Note.updateMany(
      updateCriteria,
      { $set: updatedData }
    );
    console.log('Resultado de updateMany:', result);

    if (result.modifiedCount === 0) {
      console.log('No se encontró la nota para actualizar.');
      return res.status(404).send("No se encontró la nota para actualizar.");
    }

    const io = req.app.get('io');  // Obtener io desde app
    io.emit('noteUpdated');  // Emitir evento
    console.log('Notas actualizadas correctamente.');
    res.status(200).send("Notas actualizadas correctamente");
  } catch (err) {
    console.error('Error durante la actualización de la nota:', err.message);
    res.status(500).json({ message: err.message });
  }

  console.log('--- Fin de la solicitud PATCH ---');
});

// Eliminar una nota
router.delete('/:id', async (req, res) => {
  try {
    const nota = await Note.findById(req.params.id);
    if (!nota) {
      return res.status(404).json({ message: "Nota no encontrada" });
    }
    await Container.updateMany({}, { $pull: { notes: nota._id } }); // Remover la nota de todos los contenedores
    await nota.deleteOne(); // Cambiado de remove() a deleteOne()
    const io = req.app.get('io');  // Obtener io desde app
    io.emit('noteUpdated');  // Emitir evento
    res.json({ message: 'Nota eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mover una nota al "contenedor principal" (fuera de cualquier contenedor secundario)
router.patch('/move-to-main/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params;

    // Remover la nota de todos los contenedores
    await Container.updateMany({}, { $pull: { notes: noteId } });

    // Actualizar la nota para que no tenga containerId
    await Note.findByIdAndUpdate(noteId, { containerId: null });

    const io = req.app.get('io');  // Obtener io desde app
    io.emit('noteUpdated');  // Emitir evento
    res.json({ message: 'Nota movida al contenedor principal' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
