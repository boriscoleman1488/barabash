const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
const User = require('./models/User');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Підключаємося до бази даних
    await mongoose.connect(process.env.MONGOURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Підключено до MongoDB');

    // Перевіряємо чи існує адміністратор
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: 'admin@bestflix.com' },
        { username: 'admin' }
      ]
    });

    if (existingAdmin) {
      console.log('Адміністратор вже існує:', existingAdmin.email);
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Помилка створення адміністратора:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Відключено від MongoDB');
    process.exit(0);
  }
}

createAdminUser();