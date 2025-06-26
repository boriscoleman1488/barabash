const Movie = require('../models/Movie');
const { deleteFromCloudinary, getPublicIdFromUrl } = require('../config/cloudinary');

const createMovie = async (req, res) => {
  try {
    console.log('=== ПОЧАТКОВІ ДАНІ З ФОРМИ ===');
    console.log('req.body:', JSON.stringify(req.body, null, 2));
    console.log('req.files:', req.files);
    console.log('=== КІНЕЦЬ ПОЧАТКОВИХ ДАНИХ ===');
    
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

    // Валідація обов'язкових полів
    if (!movieData.title || !movieData.description || !movieData.posterImage || !movieData.releaseYear) {
      return res.status(400).json({
        success: false,
        message: 'Обов\'язкові поля: title, description, posterImage, releaseYear'
      });
    }

    // Перетворення числових полів
    if (movieData.duration) {
      movieData.duration = parseInt(movieData.duration);
    }
    if (movieData.releaseYear) {
      movieData.releaseYear = parseInt(movieData.releaseYear);
    }
    if (movieData.views) {
      movieData.views = parseInt(movieData.views) || 0;
    }
    if (movieData.likes) {
      movieData.likes = parseInt(movieData.likes) || 0;
    }
    if (movieData.rating) {
      movieData.rating = parseFloat(movieData.rating) || 0;
    }

    // Обробка жанрів
    if (movieData.genres) {
      if (typeof movieData.genres === 'string') {
        try {
          movieData.genres = JSON.parse(movieData.genres);
        } catch {
          movieData.genres = movieData.genres.split(',').map(g => g.trim());
        }
      }
    }

    // Обробка акторів
    if (movieData.cast && typeof movieData.cast === 'string') {
      movieData.cast = movieData.cast.split(',').map(c => c.trim());
    }

    // Обробка сезонів для серіалів
    if (movieData.seasons && typeof movieData.seasons === 'string') {
      try {
        movieData.seasons = JSON.parse(movieData.seasons);
      } catch {
        movieData.seasons = [];
      }
    }

    // Обробка pricing
    if (movieData['pricing.buyPrice'] !== undefined) {
      movieData.pricing = {
        buyPrice: parseFloat(movieData['pricing.buyPrice']) || 0,
        isFree: movieData['pricing.isFree'] === 'true'
      };
      delete movieData['pricing.buyPrice'];
      delete movieData['pricing.isFree'];
    }

    // Видаляємо пусті поля
    Object.keys(movieData).forEach(key => {
      if (movieData[key] === '' || movieData[key] === null || movieData[key] === undefined) {
        delete movieData[key];
      }
    });

    // Виводимо дані перед збереженням у базу
    console.log('=== ДАНІ ДЛЯ ЗБЕРЕЖЕННЯ У БАЗУ ===');
    console.log('movieData:', JSON.stringify(movieData, null, 2));
    console.log('=== КІНЕЦЬ ДАНИХ ===');

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
  try {
    const { id } = req.params;
    const existingMovie = await Movie.findById(id);
    
    if (!existingMovie) {
      return res.status(404).json({ 
        success: false,
        message: 'Фільм не знайдено' 
      });
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

    // Обробка жанрів та акторів
    if (updateData.genres && typeof updateData.genres === 'string') {
      try {
        updateData.genres = JSON.parse(updateData.genres);
      } catch {
        updateData.genres = updateData.genres.split(',').map(g => g.trim());
      }
    }
    
    if (updateData.cast && typeof updateData.cast === 'string') {
      updateData.cast = updateData.cast.split(',').map(c => c.trim());
    }

    // Обробка сезонів
    if (updateData.seasons && typeof updateData.seasons === 'string') {
      try {
        updateData.seasons = JSON.parse(updateData.seasons);
      } catch {
        updateData.seasons = [];
      }
    }

    // Обробка pricing
    if (updateData.pricing && typeof updateData.pricing === 'string') {
      try {
        updateData.pricing = JSON.parse(updateData.pricing);
      } catch {
        updateData.pricing = { buyPrice: 0, isFree: true };
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
      success: true,
      message: 'Фільм успішно оновлено',
      movie: updatedMovie
    });
  } catch (error) {
    console.error('Помилка оновлення фільму:', error);
    res.status(500).json({ 
      success: false,
      message: 'Помилка сервера при оновленні фільму',
      error: error.message 
    });
  }
};

const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findById(id);
    
    if (!movie) {
      return res.status(404).json({ 
        success: false,
        message: 'Фільм не знайдено' 
      });
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

    res.status(200).json({ 
      success: true,
      message: 'Фільм та всі пов\'язані файли успішно видалено' 
    });
  } catch (error) {
    console.error('Помилка видалення фільму:', error);
    res.status(500).json({ 
      success: false,
      message: 'Помилка сервера при видаленні фільму',
      error: error.message 
    });
  }
};

const getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Фільм не знайдено'
      });
    }
    
    res.status(200).json({
      success: true,
      movie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Помилка сервера',
      error: error.message
    });
  }
};

const getAllMovies = async (req, res) => {
  try {
    const { 
      genre, 
      type, 
      page = 1, 
      limit = 10, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};
    
    if (genre) {
      query.genres = { $in: [genre] };
    }
    
    if (type) {
      query.type = type;
    }
    
    if (search) {
      // Використовуємо регулярні вирази замість текстового пошуку
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { director: searchRegex },
        { cast: { $in: [searchRegex] } },
        { genres: { $in: [searchRegex] } }
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const movies = await Movie.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Movie.countDocuments(query);

    res.status(200).json({
      success: true,
      movies,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Помилка сервера',
      error: error.message
    });
  }
};

const searchMovies = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Параметр пошуку обов\'язковий'
      });
    }

    // Використовуємо регулярні вирази замість текстового пошуку
    const searchRegex = new RegExp(q, 'i');
    const query = {
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { director: searchRegex },
        { cast: { $in: [searchRegex] } },
        { genres: { $in: [searchRegex] } }
      ]
    };

    const skip = (page - 1) * limit;
    
    const movies = await Movie.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Movie.countDocuments(query);

    res.status(200).json({
      success: true,
      movies,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Помилка пошуку',
      error: error.message
    });
  }
};

const getMoviesByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const query = { genres: { $in: [genre] } };
    const skip = (page - 1) * limit;
    
    const movies = await Movie.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Movie.countDocuments(query);

    res.status(200).json({
      success: true,
      genre,
      movies,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Помилка отримання фільмів за жанром',
      error: error.message
    });
  }
};

const getMoviesStats = async (req, res) => {
  try {
    const totalMovies = await Movie.countDocuments();
    const totalSeries = await Movie.countDocuments({ type: 'series' });
    const totalFilms = await Movie.countDocuments({ type: 'movie' });
    
    const genreStats = await Movie.aggregate([
      { $unwind: '$genres' },
      { $group: { _id: '$genres', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const yearStats = await Movie.aggregate([
      { $group: { _id: '$releaseYear', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total: totalMovies,
        movies: totalFilms,
        series: totalSeries,
        topGenres: genreStats,
        yearDistribution: yearStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Помилка отримання статистики',
      error: error.message
    });
  }
};

module.exports = {
  createMovie,
  updateMovie,
  deleteMovie,
  getMovie,
  getAllMovies,
  searchMovies,
  getMoviesByGenre,
  getMoviesStats
};