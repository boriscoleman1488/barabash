const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "UAH" },
    paymentMethod: { type: String },
    transactionId: { type: String, unique: true },
    status: { type: String, enum: ["На розгляді", "Завершено", "Не вдалося", "Повернуто"], default: "На розгляді" },
    accessGranted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Purchase", purchaseSchema);