import apiClient from './index';

export const commentAPI = {
  // Отримати коментарі фільму
  getMovieComments: async (movieId, page = 1, limit = 20) => {
    const response = await apiClient.get(`/comments/movie/${movieId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Додати коментар
  create: async (commentData) => {
    const response = await apiClient.post('/comments', commentData);
    return response.data;
  },

  // Оновити коментар
  update: async (commentId, content) => {
    const response = await apiClient.put(`/comments/${commentId}`, { content });
    return response.data;
  },

  // Видалити коментар
  delete: async (commentId) => {
    const response = await apiClient.delete(`/comments/${commentId}`);
    return response.data;
  },

  // Пошук коментарів
  search: async (searchTerm, movieId = null, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      q: searchTerm,
      page: page.toString(),
      limit: limit.toString()
    });

    if (movieId) params.append('movieId', movieId);

    const response = await apiClient.get(`/comments/search?${params}`);
    return response.data;
  }
};