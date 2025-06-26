import apiClient from './index';

export const movieAPI = {
  // Отримати всі фільми
  getAll: async (page = 1, limit = 12, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (filters.type) params.append('type', filters.type);
    if (filters.genre) params.append('genre', filters.genre);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await apiClient.get(`/movies?${params}`);
    return response.data;
  },

  // Отримати фільм за ID
  getById: async (movieId) => {
    const response = await apiClient.get(`/movies/${movieId}`);
    return response.data;
  },

  // Пошук фільмів
  search: async (searchTerm, page = 1, limit = 12) => {
    const response = await apiClient.get(`/movies/search?q=${searchTerm}&page=${page}&limit=${limit}`);
    return response.data;
  },

  // Отримати фільми за жанром
  getByGenre: async (genre, page = 1, limit = 12) => {
    const response = await apiClient.get(`/movies/genre/${genre}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Отримати фільми за категорією
  getByCategory: async (category, page = 1, limit = 12) => {
    const response = await apiClient.get(`/movies/category/${category}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Отримати статистику фільмів
  getStats: async () => {
    const response = await apiClient.get("/movies/stats");
    return response.data;
  }
};