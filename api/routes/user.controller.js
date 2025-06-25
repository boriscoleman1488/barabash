const User = require('../models/User');
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

// Get user by ID
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

//Операції Адміністратора
const getAllUsers = async (req, res) => {
  const query = req.query.new;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  try {
    const users = query
      ? await User.find().select('-password').sort({ _id: -1 }).limit(5)
      : await User.find().select('-password').skip(skip).limit(limit);
      
    const total = await User.countDocuments();
    
    res.status(200).json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
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
      isEmailVerified: true
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
  getAllUsers, 
  getUserStats,
  createUser,
  toggleUserStatus,
  toggleAdminRole
};
