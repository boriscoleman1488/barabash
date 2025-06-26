const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    content: { type: Array },
    isActive: { type: Boolean, default: true },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

genreSchema.virtual('movies', {
  ref: 'Movie',
  localField: '_id',
  foreignField: 'genres'
});

// Індекси для пошуку
genreSchema.index({ name: 'text', description: 'text' });
genreSchema.index({ isActive: 1 });

module.exports = mongoose.model("Genre", genreSchema);