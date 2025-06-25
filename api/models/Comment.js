const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    content: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);