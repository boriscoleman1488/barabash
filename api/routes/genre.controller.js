const Genre = require('../models/Genre');
const Movie = require('../models/Movie');

const createGenre = async (req, res) => {
  try {
    const { name, description, content } = req.body;
    
    const existingGenre = await Genre.findOne({ name });
    
    if (existingGenre) {
      return res.status(400).json({
        success: false,
        message: "Жанр з такою назвою вже існує"
      });
    }
    
    const genre = await Genre.create({
      name,
      description,
      content: content || []
    });
    
    res.status(201).json({
      success: true,
      message: "Жанр успішно створений",
      genre
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message
    });
  }
};

const updateGenre = async (req, res) => {
  try {
    const { name, description, content } = req.body;
    
    if (name) {
      const existingGenre = await Genre.findOne({ 
        name, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingGenre) {
        return res.status(400).json({
          success: false,
          message: "Жанр з такою назвою вже існує"
        });
      }
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    
    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (!genre) {
      return res.status(404).json({
        success: false,
        message: "Жанр не знайдено"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Жанр успішно оновлено",
      genre
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message
    });
  }
};

const getAllGenres = async (req, res) => {
  try {
    const { active, page = 1, limit = 10, withMovieCount = false } = req.query;
    
    let filter = {};
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }
    
    const skip = (page - 1) * limit;
    
    const genres = await Genre.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Додаємо кількість фільмів для кожного жанру, якщо потрібно
    let genresWithCount = genres;
    if (withMovieCount === 'true') {
      genresWithCount = await Promise.all(
        genres.map(async (genre) => {
          const moviesCount = await Movie.countDocuments({ genres: genre._id });
          return {
            ...genre.toObject(),
            moviesCount
          };
        })
      );
    }
    
    const total = await Genre.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: genres.length,
      genres: genresWithCount,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message
    });
  }
};

const getGenreById = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id).select('-__v');
    
    if (!genre) {
      return res.status(404).json({
        success: false,
        message: "Жанр не знайдено"
      });
    }

    // Отримуємо фільми цього жанру
    const movies = await Movie.find({ genres: genre._id })
      .populate('categories', 'name')
      .select('title posterImage duration releaseYear categories type');
    
    res.status(200).json({
      success: true,
      genre: {
        ...genre.toObject(),
        moviesCount: movies.length
      },
      movies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message
    });
  }
};

const deleteGenre = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);
    
    if (!genre) {
      return res.status(404).json({
        success: false,
        message: "Жанр не знайдено"
      });
    }

    // Перевіряємо чи є фільми з цим жанром
    const moviesCount = await Movie.countDocuments({ genres: genre._id });
    
    if (moviesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Неможливо видалити жанр. З ним пов'язано ${moviesCount} фільм(ів). Спочатку видаліть або змініть жанр у фільмах.`
      });
    }
    
    await Genre.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Жанр успішно видалено"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message
    });
  }
};

const toggleGenreStatus = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);
    
    if (!genre) {
      return res.status(404).json({
        success: false,
        message: "Жанр не знайдено"
      });
    }
    
    genre.isActive = !genre.isActive;
    await genre.save();
    
    res.status(200).json({
      success: true,
      message: `Жанр ${genre.isActive ? 'активовано' : 'деактивовано'}`,
      genre
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message
    });
  }
};

const updateGenreOrder = async (req, res) => {
  try {
    const { genreOrders } = req.body;
    
    const updatePromises = genreOrders.map(({ id }) =>
      Genre.findByIdAndUpdate(id, { new: true })
    );
    
    await Promise.all(updatePromises);
    
    res.status(200).json({
      success: true,
      message: "Порядок жанрів оновлено"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Помилка сервера",
      errorMessage: error.message
    });
  }
};

// Пошук жанрів
const searchGenres = async (req, res) => {
  try {
    const { q, isActive = true } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Параметр пошуку обов\'язковий'
      });
    }

    const filter = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ],
      isActive: isActive === 'true'
    };

    const genres = await Genre.find(filter)
      .sort({ createdAt: -1 })
      .limit(20);

    // Додаємо кількість фільмів для кожного жанру
    const genresWithCount = await Promise.all(
      genres.map(async (genre) => {
        const moviesCount = await Movie.countDocuments({ genres: genre._id });
        return {
          ...genre.toObject(),
          moviesCount
        };
      })
    );

    res.json({
      success: true,
      genres: genresWithCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Помилка пошуку жанрів',
      error: error.message
    });
  }
};

module.exports = {
  createGenre,
  getAllGenres,
  getGenreById,
  updateGenre,
  deleteGenre,
  toggleGenreStatus,
  updateGenreOrder,
  searchGenres
};