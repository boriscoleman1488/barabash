const Category = require('../models/Category');
const Movie = require('../models/Movie');

exports.createCategory = async (req, res) => {
  try {
    const { name, description, type } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Категорія з такою назвою вже існує' });
    }

    const category = new Category({
      name,
      description,
      type,
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Помилка створення категорії', error: error.message });
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
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    
    const categories = await Category.find(filter)
      .populate('movies', 'title poster duration rating')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Category.countDocuments(filter);

    res.json({
      categories,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Помилка отримання категорій', error: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('movies', 'title poster duration rating genres');
    
    if (!category) {
      return res.status(404).json({ message: 'Категорію не знайдено' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Помилка отримання категорії', error: error.message });
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
        return res.status(400).json({ message: 'Категорія з такою назвою вже існує' });
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
    ).populate('movies', 'title poster');

    if (!category) {
      return res.status(404).json({ message: 'Категорію не знайдено' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Помилка оновлення категорії', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Категорію не знайдено' });
    }

    res.json({ message: 'Категорію успішно видалено' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка видалення категорії', error: error.message });
  }
};

exports.toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Категорію не знайдено' });
    }

    category.isActive = !category.isActive;
    category.metadata.lastUpdated = new Date();
    await category.save();

    res.json({ 
      message: `Категорію ${category.isActive ? 'активовано' : 'деактивовано'}`,
      category 
    });
  } catch (error) {
    res.status(500).json({ message: 'Помилка зміни статусу категорії', error: error.message });
  }
};

exports.addMovieToCategory = async (req, res) => {
  try {
    const { movieId } = req.body;
    
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Фільм не знайдено' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Категорію не знайдено' });
    }

    if (category.movies.includes(movieId)) {
      return res.status(400).json({ message: 'Фільм вже додано до цієї категорії' });
    }

    category.movies.push(movieId);
    category.metadata.lastUpdated = new Date();
    await category.save();

    await category.populate('movies', 'title poster');
    res.json({ message: 'Фільм додано до категорії', category });
  } catch (error) {
    res.status(500).json({ message: 'Помилка додавання фільму до категорії', error: error.message });
  }
};

exports.removeMovieFromCategory = async (req, res) => {
  try {
    const { movieId } = req.params;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Категорію не знайдено' });
    }

    category.movies = category.movies.filter(id => id.toString() !== movieId);
    await category.save();

    await category.populate('movies', 'title poster');
    res.json({ message: 'Фільм видалено з категорії', category });
  } catch (error) {
    res.status(500).json({ message: 'Помилка видалення фільму з категорії', error: error.message });
  }
};


exports.getCategoryMovies = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const category = await Category.findById(req.params.id)
      .populate({
        path: 'movies',
        select: 'title description poster duration rating genres releaseYear',
        options: {
          skip: skip,
          limit: parseInt(limit)
        }
      });

    if (!category) {
      return res.status(404).json({ message: 'Категорію не знайдено' });
    }

    const totalMovies = await Category.findById(req.params.id).select('movies');
    const total = totalMovies.movies.length;

    res.json({
      category: {
        _id: category._id,
        name: category.name,
        description: category.description,
        type: category.type
      },
      movies: category.movies,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Помилка отримання фільмів категорії', error: error.message });
  }
};

exports.searchCategories = async (req, res) => {
  try {
    const { q, type, isActive = true } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Параметр пошуку обов\'язковий' });
    }

    const filter = {
      $text: { $search: q },
      isActive: isActive === 'true'
    };

    if (type) filter.type = type;

    const categories = await Category.find(filter, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .populate('movies', 'title poster')
      .limit(20);

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Помилка пошуку категорій', error: error.message });
  }
};