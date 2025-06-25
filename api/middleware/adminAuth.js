const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  const authHeader = req.headers.token;
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Токен доступу не надано"
    });
  }
  
  try {
    const token = authHeader.split(" ")[1];
    
    const decoded = jwt.verify(token, process.env.SECRET_KEY_FOR_CRYPTOJS);
    
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Користувач не знайдений"
      });
    }
    
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Доступ заборонено. Потрібні права адміністратора."
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Акаунт деактивовано"
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Недійсний токен"
    });
  }
};

module.exports = adminAuth;