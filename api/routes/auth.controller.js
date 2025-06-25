const User = require('../models/User');
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Створюємо транспортер тільки якщо є правильні налаштування
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS && 
    process.env.EMAIL_USER !== 'your-email@gmail.com') {
  transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
const sendVerificationEmail = async (email, token) => {
  if (!transporter) {
    console.log('Email транспортер не налаштований, пропускаємо відправку email');
    return;
  }

  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Підтвердження email - BestFlix',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">BestFlix</h1>
        </div>
        
        <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1e293b; margin-top: 0;">Підтвердження email адреси</h2>
          
          <p style="color: #475569; line-height: 1.6;">
            Дякуємо за реєстрацію в BestFlix! Для завершення реєстрації, будь ласка, підтвердіть вашу email адресу.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
              Підтвердити email
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">
            Якщо кнопка не працює, скопіюйте та вставте це посилання в ваш браузер:
          </p>
          <p style="color: #2563eb; font-size: 14px; word-break: break-all; margin-top: 5px;">
            ${verificationUrl}
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            Це посилання дійсне протягом 24 годин. Якщо ви не реєструвалися в BestFlix, просто проігноруйте цей лист.
          </p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Register user
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
      emailVerificationEndTime: verificationEndTime,
      isEmailVerified: !transporter // Якщо немає email, автоматично підтверджуємо
    });

    // Send verification email only if transporter is configured
    if (transporter) {
      try {
        await sendVerificationEmail(email, verificationToken);
      } catch (emailError) {
        console.log('Помилка відправки email:', emailError.message);
        // Не блокуємо реєстрацію через помилку email
      }
    }

    res.status(201).json({
      success: true,
      message: transporter ? 
        "Користувач створений. Перевірте email для підтвердження." :
        "Користувач створений та автоматично підтверджений.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified
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

    // Check if email is verified (тільки якщо email сервіс налаштований)
    if (transporter && !user.isEmailVerified) {
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

    if (!transporter) {
      return res.status(400).json({
        success: false,
        message: "Email сервіс не налаштований"
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationEndTime = verificationEndTime;
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
      res.status(200).json({
        success: true,
        message: "Email підтвердження відправлено"
      });
    } catch (emailError) {
      res.status(500).json({
        success: false,
        message: "Помилка відправки email",
        errorMessage: emailError.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message
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

    if (!transporter) {
      return res.status(400).json({
        success: false,
        message: "Email сервіс не налаштований"
      });
    }

    // Generate reset token
    const resetToken = generateVerificationToken();
    const resetEndTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetEndTime = resetEndTime;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Функція відновлення паролю буде доступна після налаштування email сервісу"
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