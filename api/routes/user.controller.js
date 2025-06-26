const User = require('../models/User');
const Movie = require('../models/Movie');
const Payment = require('../models/Payment');
const CryptoJS = require("crypto-js");

const updateUser = async (req, res) => {
  const { id } = req.params;
  
  if (req.user.id === id || req.user.isAdmin) {
    if (req.body.password) {
      req.body.password = CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_KEY_FOR_CRYPTOJS
      ).toString();
    }
    
    try {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      ).select('-password');
      
      res.status(200).json({
        success: true,
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Помилка сервера",
        errorMessage: error.message,
      });
    }
  } else {
    res.status(403).json({
      success: false,
      message: "Ви можете оновлювати тільки свій акаунт!",
    });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  
  if (req.user.id === id || req.user.isAdmin) {
    try {
      await User.findByIdAndDelete(id);
      
      res.status(200).json({
        success: true,
        message: "Користувач успішно видалений!",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Помилка сервера",
        errorMessage: error.message,
      });
    }
  } else {
    res.status(403).json({
      success: false,
      message: "Ви можете видаляти тільки свій акаунт!",
    });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Користувач не знайдений"
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message
    });
  }
};

// Отримання профілю поточного користувача з детальною інформацією
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Отримуємо користувача
    const user = await User.findById(userId)
      .select('-password')
      .populate('favoriteMovies', 'title posterImage type pricing')
      .populate('purchasedMovies.movieId', 'title posterImage type pricing');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Користувач не знайдений"
      });
    }

    // Отримуємо статистику оплат
    const paymentsStats = await Payment.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Отримуємо останні оплати
    const recentPayments = await Payment.find({ userId })
      .populate('movieId', 'title posterImage type')
      .sort({ createdAt: -1 })
      .limit(5);

    // Підраховуємо загальну статистику
    const totalSpent = paymentsStats
      .filter(stat => stat._id === 'completed')
      .reduce((sum, stat) => sum + stat.totalAmount, 0);

    const totalPurchases = paymentsStats
      .filter(stat => stat._id === 'completed')
      .reduce((sum, stat) => sum + stat.count, 0);

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        stats: {
          totalSpent,
          totalPurchases,
          favoriteMoviesCount: user.favoriteMovies.length,
          purchasedMoviesCount: user.purchasedMovies.length
        }
      },
      recentPayments,
      paymentsStats
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message
    });
  }
};

// Додавання фільму до улюблених
const addToFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.body;

    // Перевіряємо чи існує фільм
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Фільм не знайдено"
      });
    }

    // Додаємо до улюблених
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favoriteMovies: movieId } },
      { new: true }
    ).populate('favoriteMovies', 'title posterImage type');

    res.json({
      success: true,
      message: "Фільм додано до улюблених",
      favoriteMovies: user.favoriteMovies
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message
    });
  }
};

// Видалення фільму з улюблених
const removeFromFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { favoriteMovies: movieId } },
      { new: true }
    ).populate('favoriteMovies', 'title posterImage type');

    res.json({
      success: true,
      message: "Фільм видалено з улюблених",
      favoriteMovies: user.favoriteMovies
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message
    });
  }
};

// Отримання улюблених фільмів
const getFavoriteMovies = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 12 } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Користувач не знайдений"
      });
    }

    const skip = (page - 1) * limit;
    const favoriteMovieIds = user.favoriteMovies;

    const movies = await Movie.find({ _id: { $in: favoriteMovieIds } })
      .populate('genres', 'name')
      .populate('categories', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = favoriteMovieIds.length;

    res.json({
      success: true,
      movies,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get favorite movies error:', error);
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message
    });
  }
};

// Отримання придбаних фільмів
const getPurchasedMovies = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 12 } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Користувач не знайдений"
      });
    }

    const skip = (page - 1) * limit;
    const purchasedMovieIds = user.purchasedMovies.map(pm => pm.movieId);

    const movies = await Movie.find({ _id: { $in: purchasedMovieIds } })
      .populate('genres', 'name')
      .populate('categories', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Додаємо інформацію про покупку до кожного фільму
    const moviesWithPurchaseInfo = movies.map(movie => {
      const purchaseInfo = user.purchasedMovies.find(
        pm => pm.movieId.toString() === movie._id.toString()
      );
      return {
        ...movie.toObject(),
        purchaseInfo
      };
    });

    const total = purchasedMovieIds.length;

    res.json({
      success: true,
      movies: moviesWithPurchaseInfo,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get purchased movies error:', error);
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message
    });
  }
};

// Перевірка доступу до фільму
const checkMovieAccess = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    // Перевіряємо чи фільм безкоштовний
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Фільм не знайдено"
      });
    }

    if (movie.pricing.isFree) {
      return res.json({
        success: true,
        hasAccess: true,
        reason: 'free'
      });
    }

    // Перевіряємо чи користувач купив фільм
    const payment = await Payment.findOne({
      userId,
      movieId,
      status: 'completed',
      accessGranted: true,
      $or: [
        { accessExpiryDate: { $exists: false } },
        { accessExpiryDate: { $gt: new Date() } }
      ]
    });

    if (payment) {
      return res.json({
        success: true,
        hasAccess: true,
        reason: 'purchased',
        expiryDate: payment.accessExpiryDate
      });
    }

    res.json({
      success: true,
      hasAccess: false,
      reason: 'not_purchased',
      price: movie.pricing.buyPrice
    });
  } catch (error) {
    console.error('Check movie access error:', error);
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message
    });
  }
};

const getAllUsers = async (req, res) => {
  const query = req.query.new;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  try {
    const users = query
      ? await User.find().select('-password').sort({ _id: -1 }).limit(5)
      : await User.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit);
      
    const total = await User.countDocuments();
    
    res.status(200).json({
      success: true,
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message
    });
  }
};

const getUserStats = async (req, res) => {
  const today = new Date();
  const lastYear = today.setFullYear(today.setFullYear() - 1);
  
  const monthArray = [
    "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
    "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень",
  ];
  
  try {
    const data = await User.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message
    });
  }
};

const createUser = async (req, res) => {
  const { username, email, password, firstName, lastName, isAdmin } = req.body;
  
  try {
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Користувач з таким email або username вже існує"
      });
    }
    
    const user = await User.create({
      username,
      email,
      password: CryptoJS.AES.encrypt(
        password,
        process.env.SECRET_KEY_FOR_CRYPTOJS
      ).toString(),
      firstName,
      lastName,
      isAdmin: isAdmin || false,
      isActive: true
    });
    
    const { password: userPassword, ...userInfo } = user._doc;
    
    res.status(201).json({
      success: true,
      message: "Користувач створений",
      user: userInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message
    });
  }
};

const toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  
  try {
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Користувач не знайдений"
      });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `Користувач ${user.isActive ? 'активований' : 'деактивований'}`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message
    });
  }
};

const toggleAdminRole = async (req, res) => {
  const { id } = req.params;
  
  try {
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Користувач не знайдений"
      });
    }
    
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Ви не можете змінити свою роль адміністратора"
      });
    }
    
    user.isAdmin = !user.isAdmin;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `Користувач ${user.isAdmin ? 'призначений' : 'знятий з посади'} адміністратором`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message
    });
  }
};

module.exports = { 
  updateUser, 
  deleteUser, 
  getUser, 
  getUserProfile,
  addToFavorites,
  removeFromFavorites,
  getFavoriteMovies,
  getPurchasedMovies,
  checkMovieAccess,
  getAllUsers, 
  getUserStats,
  createUser,
  toggleUserStatus,
  toggleAdminRole
};