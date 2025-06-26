import apiClient from './index';

export const movieAPI = {
  // Отримати всі фільми
  getAll: async (page = 1, limit = 10) => {
    const response = await apiClient.get(`/movies?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Створити фільм
  create: async (movieData) => {
    const response = await apiClient.post("/movies", movieData);
    return response.data;
  },

  // Оновити фільм
  update: async (movieId, movieData) => {
    const response = await apiClient.put(`/movies/${movieId}`, movieData);
    return response.data;
  },

  // Видалити фільм
  delete: async (movieId) => {
    const response = await apiClient.delete(`/movies/${movieId}`);
    return response.data;
  },

  // Отримати фільм за ID
  getById: async (movieId) => {
    const response = await apiClient.get(`/movies/${movieId}`);
    return response.data;
  },

  // Пошук фільмів
  search: async (searchTerm, page = 1, limit = 10) => {
    const response = await apiClient.get(`/movies/search?q=${searchTerm}&page=${page}&limit=${limit}`);
    return response.data;
  },

  // Отримати фільми за жанром
  getByGenre: async (genre, page = 1, limit = 10) => {
    const response = await apiClient.get(`/movies/genre/${genre}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Отримати статистику фільмів
  getStats: async () => {
    const response = await apiClient.get("/movies/stats");
    return response.data;
  }
};