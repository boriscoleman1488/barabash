import apiClient from './index';

export const genreAPI = {
  // Отримати всі жанри
  getAll: async (page = 1, limit = 10) => {
    const response = await apiClient.get(`/genres?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Створити жанр
  create: async (genreData) => {
    const response = await apiClient.post("/genres", genreData);
    return response.data;
  },

  // Оновити жанр
  update: async (genreId, genreData) => {
    const response = await apiClient.put(`/genres/${genreId}`, genreData);
    return response.data;
  },

  // Видалити жанр
  delete: async (genreId) => {
    const response = await apiClient.delete(`/genres/${genreId}`);
    return response.data;
  },

  // Отримати статистику жанрів
  getStats: async () => {
    const response = await apiClient.get("/genres/stats");
    return response.data;
  },

  // Пошук жанрів
  search: async (searchTerm, page = 1, limit = 10) => {
    const response = await apiClient.get(`/genres/search?q=${searchTerm}&page=${page}&limit=${limit}`);
    return response.data;
  }
};