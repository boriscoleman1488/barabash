const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    type: { type: String, required: true, },
    movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Індекси для пошуку
categorySchema.index({ name: 'text', description: 'text', type: "text" });
categorySchema.index({ isActive: 1 });

module.exports = mongoose.model("Category", categorySchema);