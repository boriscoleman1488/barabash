const User = require('../models/User');
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Підтвердження email - BestFlix',
    html: `
      <h2>Підтвердження email</h2>
      <p>Натисніть на посилання нижче для підтвердження вашого email:</p>
      <a href="${verificationUrl}">Підтвердити email</a>
      <p>Посилання дійсне протягом 24 годин.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send password reset email
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Відновлення паролю - BestFlix',
    html: `
      <h2>Відновлення паролю</h2>
      <p>Натисніть на посилання нижче для відновлення паролю:</p>
      <a href="${resetUrl}">Відновити пароль</a>
      <p>Посилання дійсне протягом 1 години.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Register user
const registerUser = async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;

  try {
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

    const verificationToken = generateVerificationToken();
    const verificationEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create user
    const user = await User.create({
      username,
      email,
      password: CryptoJS.AES.encrypt(
        password,
        process.env.SECRET_KEY_FOR_CRYPTOJS
      ).toString(),
      firstName,
      lastName,
      emailVerificationToken: verificationToken,
      emailVerificationEndTime: verificationEndTime
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      success: true,
      message: "Користувач створений. Перевірте email для підтвердження.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message,
    });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationEndTime: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Недійсний або прострочений токен"
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationEndTime = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email успішно підтверджено"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message
    });
  }
};

// Resend verification email
const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Користувач не знайдений"
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email вже підтверджено"
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationEndTime = verificationEndTime;
    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({
      success: true,
      message: "Email підтвердження відправлено"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
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

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: "Email не підтверджено. Перевірте пошту або запросіть повторне підтвердження."
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
      { EndTimeIn: "30d" }
    );

    const { password: userPassword, ...info } = user._doc;

    res.status(200).json({
      success: true,
      ...info,
      accessToken
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message,
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Користувач з таким email не знайдений"
      });
    }

    // Generate reset token
    const resetToken = generateVerificationToken();
    const resetEndTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetEndTime = resetEndTime;
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({
      success: true,
      message: "Інструкції для відновлення паролю відправлено на email"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetEndTime: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Недійсний або прострочений токен"
      });
    }

    // Update password
    user.password = CryptoJS.AES.encrypt(
      password,
      process.env.SECRET_KEY_FOR_CRYPTOJS
    ).toString();
    user.passwordResetToken = undefined;
    user.passwordResetEndTime = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Пароль успішно оновлено"
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
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  loginUser,
  forgotPassword,
  resetPassword
};
