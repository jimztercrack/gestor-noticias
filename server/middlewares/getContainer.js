const Container = require('../models/Container');

async function getContainer(req, res, next) {
  try {
    const container = await Container.findById(req.params.id).populate({
      path: 'items.item',
      populate: { path: 'containerId', model: 'Container' }
    });
    if (!container) return res.status(404).json({ message: 'Contenedor no encontrado' });
    res.container = container;
    next();
  } catch (err) {
    console.error('Error al obtener el contenedor:', err);
    return res.status(500).json({ message: err.message });
  }
}

module.exports = getContainer;
