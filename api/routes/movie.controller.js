const Movie = require('../models/Movie');
const Genre = require('../models/Genre');
const Category = require('../models/Category');
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
      console.log('Файли отримані:', req.files);
      if (req.files.posterImage && req.files.posterImage[0]) {
        console.log('Poster path:', req.files.posterImage[0].path);
        movieData.posterImage = req.files.posterImage[0].path;
      }
      if (req.files.trailerUrl && req.files.trailerUrl[0]) {
        console.log('Trailer path:', req.files.trailerUrl[0].path);
        movieData.trailerUrl = req.files.trailerUrl[0].path;
      }
      if (req.files.videoUrl && req.files.videoUrl[0]) {
        console.log('Video path:', req.files.videoUrl[0].path);
        movieData.videoUrl = req.files.videoUrl[0].path;
      }
    } else {
      console.log('Файли не отримані або req.files undefined');
    }

    // Додаткова перевірка для запобігання передачі пустих об'єктів
    if (!movieData.posterImage || typeof movieData.posterImage === 'object' || movieData.posterImage === '{}' || movieData.posterImage === '') {
      delete movieData.posterImage;
    }
    if (!movieData.trailerUrl || typeof movieData.trailerUrl === 'object' || movieData.trailerUrl === '{}' || movieData.trailerUrl === '') {
      delete movieData.trailerUrl;
    }
    if (!movieData.videoUrl || typeof movieData.videoUrl === 'object' || movieData.videoUrl === '{}' || movieData.videoUrl === '') {
      delete movieData.videoUrl;
    }

    // Очищення всіх полів з пустими об'єктами (але НЕ пустими рядками)
    Object.keys(movieData).forEach(key => {
      if (typeof movieData[key] === 'object' && movieData[key] !== null && !Array.isArray(movieData[key]) && Object.keys(movieData[key]).length === 0) {
        delete movieData[key];
      }
    });

    // Обробка пустих рядків для необов'язкових полів
    if (movieData.film_language === '') {
      delete movieData.film_language; // Видаляємо пустий рядок, щоб не зберігати його в базі
    }
    if (movieData.country === '') {
      delete movieData.country;
    }
    if (movieData.director === '') {
      delete movieData.director;
    }
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

    // Обробка жанрів - перетворюємо ID в ObjectId
    if (movieData.genres) {
      let genreIds = [];
      if (typeof movieData.genres === 'string') {
        try {
          genreIds = JSON.parse(movieData.genres);
        } catch {
          genreIds = movieData.genres.split(',').map(g => g.trim());
        }
      } else if (Array.isArray(movieData.genres)) {
        genreIds = movieData.genres;
      }

      // Знаходимо жанри за їх ID
      const genreObjects = await Genre.find({ _id: { $in: genreIds } });
      movieData.genres = genreObjects.map(genre => genre._id);
      
      console.log('Знайдені жанри:', genreObjects.map(g => ({ name: g.name, id: g._id })));
    }

    // Обробка категорій - перетворюємо ID в ObjectId
    if (movieData.categories) {
      let categoryIds = [];
      if (typeof movieData.categories === 'string') {
        try {
          categoryIds = JSON.parse(movieData.categories);
        } catch {
          categoryIds = movieData.categories.split(',').map(c => c.trim());
        }
      } else if (Array.isArray(movieData.categories)) {
        categoryIds = movieData.categories;
      }

      // Знаходимо категорії за їх ID
      const categoryObjects = await Category.find({ _id: { $in: categoryIds } });
      movieData.categories = categoryObjects.map(category => category._id);
      
      console.log('Знайдені категорії:', categoryObjects.map(c => ({ name: c.name, id: c._id })));
    }

    // Виправлення для cast - правильна обробка масиву
    if (movieData.cast) {
      if (typeof movieData.cast === 'string') {
        try {
          movieData.cast = JSON.parse(movieData.cast);
        } catch {
          movieData.cast = movieData.cast.split(',').map(c => c.trim());
        }
      }
      // Якщо cast вже масив, але містить JSON-рядки, розпарсимо їх
      if (Array.isArray(movieData.cast)) {
        movieData.cast = movieData.cast.map(actor => {
          if (typeof actor === 'string' && actor.startsWith('[')) {
            try {
              return JSON.parse(actor);
            } catch {
              return actor;
            }
          }
          return actor;
        }).flat(); // flat() для випрямлення вкладених масивів
      }
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

    // Заповнюємо дані про жанри та категорії для відповіді
    await savedMovie.populate('genres categories');

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

    // Обробка жанрів - перетворюємо назви в ObjectId
    if (updateData.genres) {
      let genreNames = [];
      if (typeof updateData.genres === 'string') {
        try {
          genreNames = JSON.parse(updateData.genres);
        } catch {
          genreNames = updateData.genres.split(',').map(g => g.trim());
        }
      } else if (Array.isArray(updateData.genres)) {
        genreNames = updateData.genres;
      }

      // Знаходимо ObjectId жанрів за їх назвами
      const genreObjects = await Genre.find({ name: { $in: genreNames } });
      updateData.genres = genreObjects.map(genre => genre._id);
    }

    // Обробка категорій - перетворюємо назви в ObjectId
    if (updateData.categories) {
      let categoryNames = [];
      if (typeof updateData.categories === 'string') {
        try {
          categoryNames = JSON.parse(updateData.categories);
        } catch {
          categoryNames = updateData.categories.split(',').map(c => c.trim());
        }
      } else if (Array.isArray(updateData.categories)) {
        categoryNames = updateData.categories;
      }

      // Знаходимо ObjectId категорій за їх назвами
      const categoryObjects = await Category.find({ name: { $in: categoryNames } });
      updateData.categories = categoryObjects.map(category => category._id);
    }
    
    if (updateData.cast && typeof updateData.cast === 'string') {
      updateData.cast = updateData.cast.split(',').map(c => c.trim());
    }

    // Обробка числових полів
    if (updateData.duration) {
      updateData.duration = parseInt(updateData.duration);
    }
    if (updateData.releaseYear) {
      updateData.releaseYear = parseInt(updateData.releaseYear);
    }
    if (updateData.views) {
      updateData.views = parseInt(updateData.views) || 0;
    }
    if (updateData.likes) {
      updateData.likes = parseInt(updateData.likes) || 0;
    }
    if (updateData.rating) {
      updateData.rating = parseFloat(updateData.rating) || 0;
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

    // Видаляємо пусті поля
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === '' || updateData[key] === null || updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Виводимо дані перед оновленням
    console.log('=== ДАНІ ДЛЯ ОНОВЛЕННЯ У БАЗІ ===');
    console.log('updateData:', JSON.stringify(updateData, null, 2));
    console.log('=== КІНЕЦЬ ДАНИХ ===');

    const updatedMovie = await Movie.findByIdAndUpdate(id, updateData, { new: true })
      .populate('genres categories');

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
    const movie = await Movie.findById(req.params.id)
      .populate('genres', 'name description')
      .populate('categories', 'name description type');
    
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
      category,
      type, 
      page = 1, 
      limit = 10, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};
    
    // Фільтрація за жанром (за ObjectId або назвою)
    if (genre) {
      // Спочатку спробуємо знайти жанр за назвою
      const genreObj = await Genre.findOne({ name: new RegExp(genre, 'i') });
      if (genreObj) {
        query.genres = genreObj._id;
      } else {
        // Якщо не знайшли за назвою, спробуємо за ObjectId
        query.genres = genre;
      }
    }

    // Фільтрація за категорією (за ObjectId або назвою)
    if (category) {
      // Спочатку спробуємо знайти категорію за назвою
      const categoryObj = await Category.findOne({ name: new RegExp(category, 'i') });
      if (categoryObj) {
        query.categories = categoryObj._id;
      } else {
        // Якщо не знайшли за назвою, спробуємо за ObjectId
        query.categories = category;
      }
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
        { cast: { $in: [searchRegex] } }
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const movies = await Movie.find(query)
      .populate('genres', 'name description')
      .populate('categories', 'name description type')
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
    
    // Шукаємо жанри та категорії за назвою
    const matchingGenres = await Genre.find({ name: searchRegex });
    const matchingCategories = await Category.find({ name: searchRegex });
    
    const query = {
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { director: searchRegex },
        { cast: { $in: [searchRegex] } },
        { genres: { $in: matchingGenres.map(g => g._id) } },
        { categories: { $in: matchingCategories.map(c => c._id) } }
      ]
    };

    const skip = (page - 1) * limit;
    
    const movies = await Movie.find(query)
      .populate('genres', 'name description')
      .populate('categories', 'name description type')
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

    // Знаходимо жанр за назвою або ObjectId
    let genreObj;
    if (genre.match(/^[0-9a-fA-F]{24}$/)) {
      // Якщо це ObjectId
      genreObj = await Genre.findById(genre);
    } else {
      // Якщо це назва жанру
      genreObj = await Genre.findOne({ name: new RegExp(genre, 'i') });
    }

    if (!genreObj) {
      return res.status(404).json({
        success: false,
        message: 'Жанр не знайдено'
      });
    }

    const query = { genres: genreObj._id };
    const skip = (page - 1) * limit;
    
    const movies = await Movie.find(query)
      .populate('genres', 'name description')
      .populate('categories', 'name description type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Movie.countDocuments(query);

    res.status(200).json({
      success: true,
      genre: genreObj,
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

const getMoviesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Знаходимо категорію за назвою або ObjectId
    let categoryObj;
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      // Якщо це ObjectId
      categoryObj = await Category.findById(category);
    } else {
      // Якщо це назва категорії
      categoryObj = await Category.findOne({ name: new RegExp(category, 'i') });
    }

    if (!categoryObj) {
      return res.status(404).json({
        success: false,
        message: 'Категорію не знайдено'
      });
    }

    const query = { categories: categoryObj._id };
    const skip = (page - 1) * limit;
    
    const movies = await Movie.find(query)
      .populate('genres', 'name description')
      .populate('categories', 'name description type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Movie.countDocuments(query);

    res.status(200).json({
      success: true,
      category: categoryObj,
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
      message: 'Помилка отримання фільмів за категорією',
      error: error.message
    });
  }
};

const getMoviesStats = async (req, res) => {
  try {
    const totalMovies = await Movie.countDocuments();
    const totalSeries = await Movie.countDocuments({ type: 'series' });
    const totalFilms = await Movie.countDocuments({ type: 'movie' });
    
    // Статистика по жанрах з назвами
    const genreStats = await Movie.aggregate([
      { $unwind: '$genres' },
      {
        $lookup: {
          from: 'genres',
          localField: 'genres',
          foreignField: '_id',
          as: 'genreInfo'
        }
      },
      { $unwind: '$genreInfo' },
      {
        $group: {
          _id: '$genreInfo._id',
          name: { $first: '$genreInfo.name' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Статистика по категоріях з назвами
    const categoryStats = await Movie.aggregate([
      { $unwind: '$categories' },
      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$categoryInfo._id',
          name: { $first: '$categoryInfo.name' },
          count: { $sum: 1 }
        }
      },
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
        topCategories: categoryStats,
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
  getMoviesByCategory,
  getMoviesStats
};