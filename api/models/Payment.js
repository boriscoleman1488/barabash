const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    movieId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Movie', 
      required: true 
    },
    amount: { 
      type: Number, 
      required: true 
    },
    currency: { 
      type: String, 
      default: 'UAH' 
    },
    paymentMethod: { 
      type: String, 
      enum: ['card', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer'],
      default: 'card'
    },
    transactionId: { 
      type: String, 
      unique: true,
      required: true
    },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'], 
      default: 'pending' 
    },
    paymentProvider: {
      type: String,
      enum: ['stripe', 'paypal', 'liqpay', 'fondy'],
      default: 'stripe'
    },
    providerTransactionId: String,
    accessGranted: { 
      type: Boolean, 
      default: false 
    },
    accessExpiryDate: Date,
    refundReason: String,
    refundDate: Date,
    metadata: {
      userAgent: String,
      ipAddress: String,
      deviceInfo: String
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Індекси для швидкого пошуку
paymentSchema.index({ userId: 1 });
paymentSchema.index({ movieId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ userId: 1, status: 1 });

// Virtual для отримання інформації про користувача та фільм
paymentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

paymentSchema.virtual('movie', {
  ref: 'Movie',
  localField: 'movieId',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('Payment', paymentSchema);