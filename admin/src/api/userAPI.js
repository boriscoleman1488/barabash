import apiClient from "./index";

export const userAPI = {
  // Отримати всіх користувачів
  getAll: async (page = 1, limit = 10) => {
    const response = await apiClient.get(`/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Створити користувача
  create: async (userData) => {
    const response = await apiClient.post("/users", userData);
    return response.data;
  },

  // Оновити користувача
  update: async (userId, userData) => {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Видалити користувача
  delete: async (userId) => {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  },

  // Змінити статус користувача
  toggleStatus: async (userId) => {
    const response = await apiClient.patch(`/users/${userId}/toggle-status`);
    return response.data;
  },

  // Змінити роль адміністратора
  toggleAdmin: async (userId) => {
    const response = await apiClient.patch(`/users/${userId}/toggle-admin`);
    return response.data;
  },

  // Отримати статистику користувачів
  getStats: async () => {
    const response = await apiClient.get("/users/stats");
    return response.data;
  },

  // Пошук користувачів
  search: async (searchTerm, page = 1, limit = 10) => {
    const response = await apiClient.get(`/users/search?q=${searchTerm}&page=${page}&limit=${limit}`);
    return response.data;
  }
};