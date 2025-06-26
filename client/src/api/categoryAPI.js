import apiClient from './index';

export const categoryAPI = {
  // Отримати всі категорії
  getAll: async (page = 1, limit = 50, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
    if (filters.type) params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);

    const response = await apiClient.get(`/categories?${params}`);
    return response.data;
  },

  // Отримати категорію за ID
  getById: async (categoryId) => {
    const response = await apiClient.get(`/categories/${categoryId}`);
    return response.data;
  },

  // Отримати фільми категорії
  getMovies: async (categoryId, page = 1, limit = 12) => {
    const response = await apiClient.get(`/categories/${categoryId}/movies?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Пошук категорій
  search: async (searchTerm) => {
    const response = await apiClient.get(`/categories/search?q=${searchTerm}`);
    return response.data;
  }
};