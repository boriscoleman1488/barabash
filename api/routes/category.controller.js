const Category = require('../models/Category');
const Movie = require('../models/Movie');

exports.createCategory = async (req, res) => {
  try {
    const { name, description, type } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ 
        success: false,
        message: 'Категорія з такою назвою вже існує' 
      });
    }

    const category = new Category({
      name,
      description,
      type: type || 'movie'
    });

    await category.save();
    res.status(201).json({
      success: true,
      message: 'Категорія успішно створена',
      category
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Помилка створення категорії', 
      error: error.message 
    });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const { 
      isActive, 
      type, 
      page = 1, 
      limit = 10, 
      search 
    } = req.query;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (type) filter.type = type;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const categories = await Category.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Category.countDocuments(filter);

    res.json({
      success: true,
      categories,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Помилка отримання категорій', 
      error: error.message 
    });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: 'Категорію не знайдено' 
      });
    }

    // Отримуємо фільми цієї категорії
    const movies = await Movie.find({ categories: category._id })
      .populate('genres', 'name')
      .select('title posterImage duration releaseYear genres type');

    res.json({
      success: true,
      category: {
        ...category.toObject(),
        moviesCount: movies.length
      },
      movies
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Помилка отримання категорії', 
      error: error.message 
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, description, type, isActive } = req.body;
    
    if (name) {
      const existingCategory = await Category.findOne({ 
        name, 
        _id: { $ne: req.params.id } 
      });
      if (existingCategory) {
        return res.status(400).json({ 
          success: false,
          message: 'Категорія з такою назвою вже існує' 
        });
      }
    }

    const updateData = {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(type !== undefined && { type }),
      ...(isActive !== undefined && { isActive }),
    };

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: 'Категорію не знайдено' 
      });
    }

    res.json({
      success: true,
      message: 'Категорія успішно оновлена',
      category
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Помилка оновлення категорії', 
      error: error.message 
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: 'Категорію не знайдено' 
      });
    }

    // Перевіряємо чи є фільми в цій категорії
    const moviesCount = await Movie.countDocuments({ categories: category._id });
    
    if (moviesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Неможливо видалити категорію. В ній є ${moviesCount} фільм(ів). Спочатку видаліть або перемістіть фільми.`
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({ 
      success: true,
      message: 'Категорію успішно видалено' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Помилка видалення категорії', 
      error: error.message 
    });
  }
};

exports.toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: 'Категорію не знайдено' 
      });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.json({ 
      success: true,
      message: `Категорію ${category.isActive ? 'активовано' : 'деактивовано'}`,
      category 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Помилка зміни статусу категорії', 
      error: error.message 
    });
  }
};

exports.getCategoryMovies = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: 'Категорію не знайдено' 
      });
    }

    const movies = await Movie.find({ categories: category._id })
      .populate('genres', 'name')
      .select('title description posterImage duration releaseYear genres type')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Movie.countDocuments({ categories: category._id });

    res.json({
      success: true,
      category: {
        _id: category._id,
        name: category.name,
        description: category.description,
        type: category.type
      },
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
      message: 'Помилка отримання фільмів категорії', 
      error: error.message 
    });
  }
};

exports.searchCategories = async (req, res) => {
  try {
    const { q, type, isActive = true } = req.query;
    
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

    if (type) filter.type = type;

    const categories = await Category.find(filter)
      .sort({ createdAt: -1 })
      .limit(20);

    // Додаємо кількість фільмів для кожної категорії
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const moviesCount = await Movie.countDocuments({ categories: category._id });
        return {
          ...category.toObject(),
          moviesCount
        };
      })
    );

    res.json({
      success: true,
      categories: categoriesWithCount
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Помилка пошуку категорій', 
      error: error.message 
    });
  }
};

// Додавання фільму до категорії
exports.addMovieToCategory = async (req, res) => {
  try {
    const { movieId } = req.body;
    const categoryId = req.params.id;
    
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ 
        success: false,
        message: 'Фільм не знайдено' 
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: 'Категорію не знайдено' 
      });
    }

    // Перевіряємо чи фільм вже в цій категорії
    if (movie.categories.includes(categoryId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Фільм вже додано до цієї категорії' 
      });
    }

    // Додаємо категорію до фільму
    movie.categories.push(categoryId);
    await movie.save();

    res.json({ 
      success: true,
      message: 'Фільм додано до категорії',
      movie: await movie.populate('categories genres')
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Помилка додавання фільму до категорії', 
      error: error.message 
    });
  }
};

// Видалення фільму з категорії
exports.removeMovieFromCategory = async (req, res) => {
  try {
    const { movieId } = req.params;
    const categoryId = req.params.id;
    
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ 
        success: false,
        message: 'Фільм не знайдено' 
      });
    }

    // Видаляємо категорію з фільму
    movie.categories = movie.categories.filter(cat => cat.toString() !== categoryId);
    await movie.save();

    res.json({ 
      success: true,
      message: 'Фільм видалено з категорії',
      movie: await movie.populate('categories genres')
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Помилка видалення фільму з категорії', 
      error: error.message 
    });
  }
};