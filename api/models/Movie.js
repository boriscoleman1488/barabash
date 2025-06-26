const mongoose = require("mongoose");

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
    language: { type: String },
    ageRating: { type: String, enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'], default: 'PG' },
    genres: [{ type: String }],
    director: { type: String },
    cast: [{ type: String }],
    type: { type: String, enum: ['movie', 'series'], default: 'movie' },
    
    // Для серіалів
    seasons: [{
      seasonNumber: { type: Number },
      episodes: [{
        episodeNumber: { type: Number },
        title: { type: String },
        description: { type: String },
        duration: { type: Number },
        videoUrl: { type: String }
      }]
    }],
    
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

movieSchema.index({ title: 'text', description: 'text' });
movieSchema.index({ genres: 1 });
movieSchema.index({ releaseYear: 1 });
movieSchema.index({ type: 1 });
movieSchema.index({ 'pricing.isFree': 1 });

module.exports = mongoose.model("Movie", movieSchema);