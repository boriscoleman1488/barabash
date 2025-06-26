import apiClient from './index';

export const categoryAPI = {
  // Отримати всі категорії
  getAll: async (page = 1, limit = 10) => {
    const response = await apiClient.get(`/categories?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Створити категорію
  create: async (categoryData) => {
    const response = await apiClient.post("/categories", categoryData);
    return response.data;
  },

  // Оновити категорію
  update: async (categoryId, categoryData) => {
    const response = await apiClient.put(`/categories/${categoryId}`, categoryData);
    return response.data;
  },

  // Видалити категорію
  delete: async (categoryId) => {
    const response = await apiClient.delete(`/categories/${categoryId}`);
    return response.data;
  },

  // Отримати статистику категорій
  getStats: async () => {
    const response = await apiClient.get("/categories/stats");
    return response.data;
  },

  // Пошук категорій
  search: async (searchTerm) => {
    const response = await apiClient.get(`/categories/search?q=${searchTerm}`);
    return response.data;
  }
};