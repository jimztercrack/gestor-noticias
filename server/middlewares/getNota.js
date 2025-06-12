const Nota = require('../models/Note');

async function getNota(req, res, next) {
  try {
    const nota = await Nota.findById(req.params.id);
    if (!nota) return res.status(404).json({ message: 'No se puede encontrar la nota' });
    res.nota = nota;
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = getNota;
