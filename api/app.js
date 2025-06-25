const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const path = require("path");

const authRouter = require("./routes/auth.routes");
const userRouter = require("./routes/users.routes");
const movieRouter = require("./routes/movies.routes");
const genreRouter = require("./routes/genres.routes");
const categoriesRoutes = require('./routes/categories.routes');
const commentsRoutes = require('./routes/comments.routes');

const morgan = require("morgan");

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token']
  })
);

// Logging
app.use(morgan("dev"));

// Static files
app.use(express.static(path.join(__dirname, "public/admin")));
app.use(express.static(path.join(__dirname, "public/client")));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BestFlix API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/movies", movieRouter);
app.use("/api/genres", genreRouter);
app.use('/api/categories', categoriesRoutes);
app.use('/api/comments', commentsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Внутрішня помилка сервера',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Маршрут не знайдено'
  });
});

module.exports = app;