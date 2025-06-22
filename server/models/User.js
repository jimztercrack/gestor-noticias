const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // ✅ USA bcryptjs, compatible con Render

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  role: {
    type: String,
    enum: ['admin', 'editor', 'viewer'],
    default: 'viewer'
  }
});

// Middleware: hashea la contraseña antes de guardar
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
