const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDb();
    
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
      console.log(`📡 API доступне на: http://localhost:${port}`);
      console.log(`🌐 Health check: http://localhost:${port}/health`);
    });
  } catch (error) {
    console.error("❌ Помилка запуску сервера:", error);
    
    // Якщо не вдається підключитися до MongoDB, запускаємо сервер без БД
    console.log("⚠️ Запуск сервера без підключення до БД...");
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port} (без БД)`);
      console.log(`📡 API доступне на: http://localhost:${port}`);
    });
  }
}

// Створення підключення до БД
const connectDb = async () => {
  try {
    // Перевіряємо чи є URL для MongoDB
    if (!process.env.MONGOURL || process.env.MONGOURL === 'mongodb://localhost:27017/bestflix') {
      throw new Error('MongoDB URL не налаштований або використовує localhost');
    }

    await mongoose.connect(process.env.MONGOURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB підключено успішно");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
};

const mongooseDisconnect = async () => {
  try {
    await mongoose.disconnect();
    console.log("🔌 MongoDB відключено");
  } catch (error) {
    console.error("Помилка відключення MongoDB:", error);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongooseDisconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongooseDisconnect();
  process.exit(0);
});

startServer();

module.exports = {
  connectDb,
  mongooseDisconnect,
};