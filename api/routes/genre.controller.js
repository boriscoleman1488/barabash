const Genre = require('../models/Genre');

const createGenre = async (req, res) => {
  const { name, description, icon, color } = req.body;
  
  try {
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
      icon,
      color,
      content: []
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

const getAllGenres = async (req, res) => {
  try {
    const { active } = req.query;
    
    let filter = {};
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }
    
    const genres = await Genre.find(filter)
      .select('-__v');
    
    res.status(200).json({
      success: true,
      count: genres.length,
      genres
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

const updateGenre = async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    
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
    
    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      { name, description, icon, color },
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