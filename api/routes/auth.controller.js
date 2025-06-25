const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

// Register user - без підтвердження email
const registerUser = async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;

  try {
    // Перевіряємо підключення до БД
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "База даних недоступна. Спробуйте пізніше."
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Користувач з таким email або username вже існує"
      });
    }

    // Create user - без підтвердження email
    const user = await User.create({
      username,
      email,
      password: CryptoJS.AES.encrypt(
        password,
        process.env.SECRET_KEY_FOR_CRYPTOJS
      ).toString(),
      firstName,
      lastName,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: "Користувач успішно створений! Тепер ви можете увійти в систему.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message,
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Перевіряємо підключення до БД
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "База даних недоступна. Спробуйте пізніше."
      });
    }

    let user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Неправильний email або пароль"
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Акаунт деактивовано. Зверніться до адміністратора."
      });
    }

    // Verify password
    const bytes = CryptoJS.AES.decrypt(
      user.password,
      process.env.SECRET_KEY_FOR_CRYPTOJS
    );
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== password) {
      return res.status(401).json({
        success: false,
        message: "Неправильний email або пароль"
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.SECRET_KEY_FOR_CRYPTOJS,
      { expiresIn: "30d" }
    );

    const { password: userPassword, ...info } = user._doc;

    res.status(200).json({
      success: true,
      ...info,
      accessToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message,
    });
  }
};

// Forgot password - спрощена версія
const forgotPassword = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Функція відновлення паролю тимчасово недоступна. Зверніться до адміністратора."
  });
};

// Reset password - залишаємо для сумісності
const resetPassword = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Функція відновлення паролю тимчасово недоступна"
  });
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword
};