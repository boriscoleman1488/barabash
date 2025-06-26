import apiClient from './index';

export const userAPI = {
  // Отримати профіль користувача
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  // Оновити профіль користувача
  updateProfile: async (userId, userData) => {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Додати до улюблених
  addToFavorites: async (movieId) => {
    const response = await apiClient.post('/users/favorites', { movieId });
    return response.data;
  },

  // Видалити з улюблених
  removeFromFavorites: async (movieId) => {
    const response = await apiClient.delete(`/users/favorites/${movieId}`);
    return response.data;
  },

  // Отримати улюблені фільми
  getFavorites: async (page = 1, limit = 12) => {
    const response = await apiClient.get(`/users/favorites?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Отримати придбані фільми
  getPurchased: async (page = 1, limit = 12) => {
    const response = await apiClient.get(`/users/purchased?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Перевірити доступ до фільму
  checkAccess: async (movieId) => {
    const response = await apiClient.get(`/users/access/${movieId}`);
    return response.data;
  }
};