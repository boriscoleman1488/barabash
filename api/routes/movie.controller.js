const Movie = require('../models/Movie');
const { isAdmin } = require('../middleware/adminAuth');
const { deleteFromCloudinary, getPublicIdFromUrl } = require('../config/cloudinary');

const createMovie = async (req, res) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: 'Доступ заборонено. Тільки адміністратори можуть додавати фільми.' });
  }

  try {
    const movieData = { ...req.body };

    // Обробка завантажених файлів
    if (req.files) {
      if (req.files.posterImage) {
        movieData.posterImage = req.files.posterImage[0].path;
      }
      if (req.files.trailerUrl) {
        movieData.trailerUrl = req.files.trailerUrl[0].path;
      }
      if (req.files.videoUrl) {
        movieData.videoUrl = req.files.videoUrl[0].path;
      }
    }

    // Валідація обов'язкових полів відповідно до моделі
    if (!movieData.title || !movieData.description || !movieData.posterImage || !movieData.releaseYear) {
      return res.status(400).json({
        success: false,
        message: 'Обов\'язкові поля: title, description, posterImage, releaseYear'
      });
    }

    // Обробка жанрів як масиву рядків
    if (movieData.genres && typeof movieData.genres === 'string') {
      movieData.genres = movieData.genres.split(',').map(g => g.trim());
    }

    // Обробка акторів як масиву рядків
    if (movieData.cast && typeof movieData.cast === 'string') {
      movieData.cast = movieData.cast.split(',').map(c => c.trim());
    }

    const newMovie = new Movie(movieData);
    const savedMovie = await newMovie.save();

    res.status(201).json({
      success: true,
      message: 'Фільм успішно створено',
      movie: savedMovie
    });
  } catch (error) {
    console.error('Помилка створення фільму:', error);
    res.status(500).json({ 
      success: false,
      message: 'Помилка сервера при створенні фільму',
      error: error.message 
    });
  }
};


const updateMovie = async (req, res) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: 'Доступ заборонено. Тільки адміністратори можуть оновлювати фільми.' });
  }

  try {
    const { id } = req.params;
    const existingMovie = await Movie.findById(id);
    
    if (!existingMovie) {
      return res.status(404).json({ message: 'Фільм не знайдено' });
    }

    const updateData = { ...req.body };
    const filesToDelete = [];

    if (req.files) {
      const fileFields = ['posterImage', 'backdropImage', 'thumbnailImage', 'trailerUrl', 'videoUrl'];
      
      for (const field of fileFields) {
        if (req.files[field]) {
          // Додаємо старий файл до списку для видалення
          if (existingMovie[field]) {
            const publicId = getPublicIdFromUrl(existingMovie[field]);
            if (publicId) filesToDelete.push(publicId);
          }
          
          // Встановлюємо новий URL
          updateData[field] = req.files[field][0].path;
        }
      }
    }

    const updatedMovie = await Movie.findByIdAndUpdate(id, updateData, { new: true });

    // Видаляємо старі файли з Cloudinary
    for (const publicId of filesToDelete) {
      try {
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.error(`Помилка видалення файлу ${publicId}:`, error);
      }
    }

    res.status(200).json({
      message: 'Фільм успішно оновлено',
      movie: updatedMovie
    });
  } catch (error) {
    console.error('Помилка оновлення фільму:', error);
    res.status(500).json({ 
      message: 'Помилка сервера при оновленні фільму',
      error: error.message 
    });
  }
};

// Видалення фільму
const deleteMovie = async (req, res) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: 'Доступ заборонено. Тільки адміністратори можуть видаляти фільми.' });
  }

  try {
    const { id } = req.params;
    const movie = await Movie.findById(id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Фільм не знайдено' });
    }

    // Збираємо всі файли для видалення
    const filesToDelete = [];
    const fileFields = ['posterImage', 'backdropImage', 'thumbnailImage', 'trailerUrl', 'videoUrl'];
    
    for (const field of fileFields) {
      if (movie[field]) {
        const publicId = getPublicIdFromUrl(movie[field]);
        if (publicId) filesToDelete.push(publicId);
      }
    }

    // Видаляємо фільм з бази даних
    await Movie.findByIdAndDelete(id);

    // Видаляємо файли з Cloudinary
    for (const publicId of filesToDelete) {
      try {
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.error(`Помилка видалення файлу ${publicId}:`, error);
      }
    }

    res.status(200).json({ message: 'Фільм та всі пов\'язані файли успішно видалено' });
  } catch (error) {
    console.error('Помилка видалення фільму:', error);
    res.status(500).json({ 
      message: 'Помилка сервера при видаленні фільму',
      error: error.message 
    });
  }
};

const getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json(error);
  }
};

const getAllMovies = async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json("You are not allowed to view movies!");
  }

  try {
    let query = {};
    
    if (req.query.genre) {
      query.genres = { $in: [req.query.genre] };
    }
    
    const movies = await Movie.find(query);
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  createMovie,
  updateMovie,
  deleteMovie,
  getMovie,
  getAllMovies
};
