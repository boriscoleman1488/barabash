const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    profilePicture: { type: String, default: "" },
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    passwordResetToken: { type: String },
    passwordResetEndTime: { type: Date },
    lastLogin: { type: Date },
    purchasedMovies: [{ 
      movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
      purchaseDate: { type: Date, default: Date.now },
      expiryDate: { type: Date },
      price: { type: Number }
    }],
    favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
