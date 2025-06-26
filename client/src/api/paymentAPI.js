import apiClient from './index';

export const paymentAPI = {
  // Створити оплату
  create: async (paymentData) => {
    const response = await apiClient.post('/payments', paymentData);
    return response.data;
  },

  // Підтвердити оплату
  confirm: async (transactionId, providerTransactionId) => {
    const response = await apiClient.post('/payments/confirm', {
      transactionId,
      providerTransactionId
    });
    return response.data;
  },

  // Скасувати оплату
  cancel: async (transactionId) => {
    const response = await apiClient.patch(`/payments/cancel/${transactionId}`);
    return response.data;
  },

  // Отримати оплати користувача
  getUserPayments: async (page = 1, limit = 10, status = null) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (status) params.append('status', status);

    const response = await apiClient.get(`/payments/my?${params}`);
    return response.data;
  },

  // Отримати деталі оплати
  getDetails: async (transactionId) => {
    const response = await apiClient.get(`/payments/details/${transactionId}`);
    return response.data;
  }
};