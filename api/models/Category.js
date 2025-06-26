const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    type: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    
    movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Віртуальне поле для отримання фільмів цієї категорії
categorySchema.virtual('movies', {
  ref: 'Movie',
  localField: '_id',
  foreignField: 'categories'
});

// Індекси для пошуку
categorySchema.index({ name: 'text', description: 'text', type: "text" });
categorySchema.index({ isActive: 1 });

module.exports = mongoose.model("Category", categorySchema);