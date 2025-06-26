const Genre = require('../models/Genre');

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
    const { active, page = 1, limit = 10 } = req.query;
    
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
    
    const total = await Genre.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: genres.length,
      genres,
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
    
    res.status(200).json({
      success: true,
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

const deleteGenre = async (req, res) => {
  try {
    const genre = await Genre.findByIdAndDelete(req.params.id);
    
    if (!genre) {
      return res.status(404).json({
        success: false,
        message: "Жанр не знайдено"
      });
    }
    
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

module.exports = {
  createGenre,
  getAllGenres,
  getGenreById,
  updateGenre,
  deleteGenre,
  toggleGenreStatus,
  updateGenreOrder
};