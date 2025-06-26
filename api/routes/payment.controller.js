const Payment = require('../models/Payment');
const Movie = require('../models/Movie');
const User = require('../models/User');
const crypto = require('crypto');

// Створення нової оплати
const createPayment = async (req, res) => {
  try {
    const { movieId, paymentMethod = 'card', paymentProvider = 'stripe' } = req.body;
    const userId = req.user.id;

    // Перевіряємо чи існує фільм
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Фільм не знайдено'
      });
    }

    // Перевіряємо чи фільм платний
    if (movie.pricing.isFree) {
      return res.status(400).json({
        success: false,
        message: 'Цей фільм безкоштовний'
      });
    }

    // Перевіряємо чи користувач вже купив цей фільм
    const existingPayment = await Payment.findOne({
      userId,
      movieId,
      status: 'completed',
      accessGranted: true
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Ви вже придбали цей фільм'
      });
    }

    // Генеруємо унікальний ID транзакції
    const transactionId = `txn_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

    // Створюємо оплату
    const payment = new Payment({
      userId,
      movieId,
      amount: movie.pricing.buyPrice,
      paymentMethod,
      paymentProvider,
      transactionId,
      status: 'pending',
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress
      }
    });

    await payment.save();

    // Заповнюємо дані про фільм
    await payment.populate('movieId', 'title posterImage pricing');

    res.status(201).json({
      success: true,
      message: 'Оплата створена',
      payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка створення оплати',
      error: error.message
    });
  }
};

// Підтвердження оплати
const confirmPayment = async (req, res) => {
  try {
    const { transactionId, providerTransactionId } = req.body;
    const userId = req.user.id;

    const payment = await Payment.findOne({
      transactionId,
      userId,
      status: 'pending'
    }).populate('movieId', 'title');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Оплата не знайдена або вже оброблена'
      });
    }

    // Оновлюємо статус оплати
    payment.status = 'completed';
    payment.accessGranted = true;
    payment.providerTransactionId = providerTransactionId;
    
    // Встановлюємо термін доступу (наприклад, 1 рік)
    payment.accessExpiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    await payment.save();

    // Додаємо фільм до списку придбаних користувачем
    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        purchasedMovies: {
          movieId: payment.movieId._id,
          purchaseDate: new Date(),
          expiryDate: payment.accessExpiryDate,
          price: payment.amount
        }
      }
    });

    res.json({
      success: true,
      message: 'Оплата підтверджена',
      payment
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка підтвердження оплати',
      error: error.message
    });
  }
};

// Скасування оплати
const cancelPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({
      transactionId,
      userId,
      status: 'pending'
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Оплата не знайдена або вже оброблена'
      });
    }

    payment.status = 'cancelled';
    await payment.save();

    res.json({
      success: true,
      message: 'Оплата скасована',
      payment
    });
  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка скасування оплати',
      error: error.message
    });
  }
};

// Отримання всіх оплат користувача
const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { userId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const payments = await Payment.find(filter)
      .populate('movieId', 'title posterImage pricing type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      payments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання оплат',
      error: error.message
    });
  }
};

// Отримання деталей оплати
const getPaymentDetails = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({
      transactionId,
      userId
    }).populate('movieId', 'title posterImage pricing type description');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Оплата не знайдена'
      });
    }

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання деталей оплати',
      error: error.message
    });
  }
};

// Повернення коштів (тільки для адміністраторів)
const refundPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { refundReason } = req.body;

    const payment = await Payment.findOne({
      transactionId,
      status: 'completed'
    }).populate('userId movieId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Оплата не знайдена або не може бути повернена'
      });
    }

    // Оновлюємо статус оплати
    payment.status = 'refunded';
    payment.accessGranted = false;
    payment.refundReason = refundReason;
    payment.refundDate = new Date();

    await payment.save();

    // Видаляємо фільм зі списку придбаних користувачем
    await User.findByIdAndUpdate(payment.userId._id, {
      $pull: {
        purchasedMovies: { movieId: payment.movieId._id }
      }
    });

    res.json({
      success: true,
      message: 'Кошти повернено',
      payment
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка повернення коштів',
      error: error.message
    });
  }
};

// Статистика оплат (для адміністраторів)
const getPaymentsStats = async (req, res) => {
  try {
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({ status: 'completed' });
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const failedPayments = await Payment.countDocuments({ status: 'failed' });

    // Загальна сума доходів
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Статистика по місяцях
    const monthlyStats = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Топ фільмів за продажами
    const topMovies = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$movieId',
          sales: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movie'
        }
      },
      { $unwind: '$movie' },
      {
        $project: {
          title: '$movie.title',
          sales: 1,
          revenue: 1
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      stats: {
        total: totalPayments,
        completed: completedPayments,
        pending: pendingPayments,
        failed: failedPayments,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyStats,
        topMovies
      }
    });
  } catch (error) {
    console.error('Get payments stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання статистики',
      error: error.message
    });
  }
};

// Отримання всіх оплат (для адміністраторів)
const getAllPayments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      userId, 
      movieId,
      startDate,
      endDate
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (movieId) filter.movieId = movieId;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const payments = await Payment.find(filter)
      .populate('userId', 'username email firstName lastName')
      .populate('movieId', 'title posterImage pricing type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      payments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання оплат',
      error: error.message
    });
  }
};

module.exports = {
  createPayment,
  confirmPayment,
  cancelPayment,
  getUserPayments,
  getPaymentDetails,
  refundPayment,
  getPaymentsStats,
  getAllPayments
};