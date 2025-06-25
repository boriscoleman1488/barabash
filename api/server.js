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
    });
  } catch (error) {
    console.error("❌ Помилка запуску сервера:", error);
    process.exit(1);
  }
}

//creating a db connection
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGOURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Server is up and running");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
};

const mongooseDisconnect = async () => {
  await mongoose.disconnect();
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongooseDisconnect();
  process.exit(0);
});

startServer();

module.exports = {
  connectDb,
  mongooseDisconnect,
};