const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    posterImage: { type: String, required: true },
    trailerUrl: { type: String },
    videoUrl: { type: String },
    duration: { type: Number },
    releaseYear: { type: Number, required: true },
    country: { type: String },
    film_language: { type: String },
    ageRating: { type: String, enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'], default: 'PG' },
    
    genres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
    
    director: { type: String },
    cast: [{ type: String }],
    type: { type: String, enum: ['movie'], default: 'movie' },
    
    // Ціноутворення
    pricing: {
      buyPrice: { type: Number, default: 0 },
      isFree: { type: Boolean, default: true },
    },

    // Категорії
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    
    // Статистика
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 10 }
  },
  { timestamps: true }
);

// Створюємо індекси
movieSchema.index({ title: 1 });
movieSchema.index({ description: 1 });
movieSchema.index({ genres: 1 });
movieSchema.index({ categories: 1 });
movieSchema.index({ releaseYear: 1 });
movieSchema.index({ 'pricing.isFree': 1 });
movieSchema.index({ film_language: 1 });
movieSchema.index({ country: 1 });

module.exports = mongoose.model("Movie", movieSchema);