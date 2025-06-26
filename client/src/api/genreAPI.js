import apiClient from './index';

export const genreAPI = {
  // Отримати всі жанри
  getAll: async (page = 1, limit = 50, withMovieCount = false) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (withMovieCount) params.append('withMovieCount', 'true');

    const response = await apiClient.get(`/genres?${params}`);
    return response.data;
  },

  // Отримати жанр за ID
  getById: async (genreId) => {
    const response = await apiClient.get(`/genres/${genreId}`);
    return response.data;
  },

  // Пошук жанрів
  search: async (searchTerm) => {
    const response = await apiClient.get(`/genres/search?q=${searchTerm}`);
    return response.data;
  }
};