const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bestflix/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1920, height: 1080, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ],
  },
});

const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bestflix/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'webm', 'mov', 'avi'],
  },
});

const uploadImages = multer({ 
  storage: imageStorage,
  limits: {
    fileSize: 1000 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Тільки зображення дозволені!'), false);
    }
  },
});

const uploadVideos = multer({ 
  storage: videoStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB для відео
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Тільки відео дозволені!'), false);
    }
  },
});

const uploadFields = multer({
  storage: new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
      let folder = 'bestflix/';
      let resourceType = 'auto';
      
      if (file.mimetype.startsWith('image/')) {
        folder += 'images';
        resourceType = 'image';
      } else if (file.mimetype.startsWith('video/')) {
        folder += 'videos';
        resourceType = 'video';
      }
      
      return {
        folder: folder,
        resource_type: resourceType,
        allowed_formats: file.mimetype.startsWith('image/') 
          ? ['jpg', 'jpeg', 'png', 'webp']
          : ['mp4', 'webm', 'mov', 'avi'],
      };
    },
  }),
  limits: {
    fileSize: 1000 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    // Allow specific fields and dynamic episode fields
    const allowedFields = ['posterImage', 'backdropImage', 'thumbnailImage', 'trailerUrl', 'videoUrl'];
    const isEpisodeField = /^episode_\d+_\d+$/.test(file.fieldname);
    
    if (allowedFields.includes(file.fieldname) || isEpisodeField) {
      cb(null, true);
    } else {
      cb(new Error(`Unexpected field: ${file.fieldname}`), false);
    }
  }
}).any(); // Use .any() instead of .fields() to accept dynamic field names

// Функція для видалення файлу з Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Помилка видалення з Cloudinary:', error);
    throw error;
  }
};

// Функція для отримання public_id з URL
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  return filename.split('.')[0];
};

module.exports = {
  cloudinary,
  uploadImages,
  uploadVideos,
  uploadFields,
  deleteFromCloudinary,
  getPublicIdFromUrl,
};