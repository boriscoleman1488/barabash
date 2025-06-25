const Comment = require('../models/Comment');
const Movie = require('../models/Movie');
const User = require('../models/User');

exports.createComment = async (req, res) => {
  try {
    const { movieId, content } = req.body;
    const userId = req.user.id;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Фільм не знайдено' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Коментар не може бути порожнім' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ message: 'Коментар занадто довгий (максимум 1000 символів)' });
    }

    const comment = new Comment({
      userId,
      movieId,
      content: content.trim()
    });

    await comment.save();

    await comment.populate('userId', 'username email');
    await comment.populate('movieId', 'title');

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Помилка створення коментаря', error: error.message });
  }
};

exports.getAllComments = async (req, res) => {
  try {
    const { 
      movieId, 
      userId, 
      page = 1, 
      limit = 20, 
      sort = '-createdAt' 
    } = req.query;

    const filter = {};
    if (movieId) filter.movieId = movieId;
    if (userId) filter.userId = userId;

    const skip = (page - 1) * limit;
    
    const comments = await Comment.find(filter)
      .populate('userId', 'username email')
      .populate('movieId', 'title poster')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments(filter);

    res.json({
      comments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Помилка отримання коментарів', error: error.message });
  }
};


exports.getMovieComments = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { page = 1, limit = 20, sort = '-createdAt' } = req.query;

    // Перевірити чи існує фільм
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Фільм не знайдено' });
    }

    const skip = (page - 1) * limit;
    
    const comments = await Comment.find({ movieId })
      .populate('userId', 'username email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({ movieId });

    res.json({
      movie: {
        _id: movie._id,
        title: movie.title
      },
      comments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Помилка отримання коментарів фільму', error: error.message });
  }
};

exports.getUserComments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, sort = '-createdAt' } = req.query;

    // Перевірити чи існує користувач
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    const skip = (page - 1) * limit;
    
    const comments = await Comment.find({ userId })
      .populate('movieId', 'title poster')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({ userId });

    res.json({
      user: {
        _id: user._id,
        username: user.username
      },
      comments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Помилка отримання коментарів користувача', error: error.message });
  }
};

// Отримати коментар за ID
exports.getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('userId', 'username email')
      .populate('movieId', 'title poster');
    
    if (!comment) {
      return res.status(404).json({ message: 'Коментар не знайдено' });
    }

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Помилка отримання коментаря', error: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;
    
    // Перевірити довжину коментаря
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Коментар не може бути порожнім' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ message: 'Коментар занадто довгий (максимум 1000 символів)' });
    }

    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Коментар не знайдено' });
    }

    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Ви можете редагувати тільки свої коментарі' });
    }

    comment.content = content.trim();
    await comment.save();

    await comment.populate('userId', 'username email');
    await comment.populate('movieId', 'title');

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Помилка оновлення коментаря', error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin; // Припускаємо що є поле isAdmin
    
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Коментар не знайдено' });
    }

    if (comment.userId.toString() !== userId && !isAdmin) {
      return res.status(403).json({ message: 'Ви можете видаляти тільки свої коментарі' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Коментар успішно видалено' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка видалення коментаря', error: error.message });
  }
};

exports.getCommentsStats = async (req, res) => {
  try {
    const { movieId, userId, startDate, endDate } = req.query;
    
    const matchFilter = {};
    if (movieId) matchFilter.movieId = mongoose.Types.ObjectId(movieId);
    if (userId) matchFilter.userId = mongoose.Types.ObjectId(userId);
    if (startDate || endDate) {
      matchFilter.createdAt = {};
      if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
      if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
    }

    const stats = await Comment.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalComments: { $sum: 1 },
          avgContentLength: { $avg: { $strLenCP: '$content' } },
          firstComment: { $min: '$createdAt' },
          lastComment: { $max: '$createdAt' }
        }
      }
    ]);

    // Статистика по фільмах
    const movieStats = await Comment.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$movieId',
          commentCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movie'
        }
      },
      { $unwind: '$movie' },
      {
        $project: {
          movieTitle: '$movie.title',
          commentCount: 1
        }
      },
      { $sort: { commentCount: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      general: stats[0] || {
        totalComments: 0,
        avgContentLength: 0,
        firstComment: null,
        lastComment: null
      },
      topMoviesByComments: movieStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Помилка отримання статистики', error: error.message });
  }
};

exports.searchComments = async (req, res) => {
  try {
    const { q, movieId, userId, page = 1, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Параметр пошуку обов\'язковий' });
    }

    const filter = {
      content: { $regex: q, $options: 'i' }
    };

    if (movieId) filter.movieId = movieId;
    if (userId) filter.userId = userId;

    const skip = (page - 1) * limit;

    const comments = await Comment.find(filter)
      .populate('userId', 'username email')
      .populate('movieId', 'title poster')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments(filter);

    res.json({
      query: q,
      comments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Помилка пошуку коментарів', error: error.message });
  }
};