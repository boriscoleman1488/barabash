const express = require('express');
const router = express.Router();
const verifyToken = require('../verifyToken');
const adminAuth = require('../middleware/adminAuth');

const {
  createPayment,
  confirmPayment,
  cancelPayment,
  getUserPayments,
  getPaymentDetails,
  refundPayment,
  getPaymentsStats,
  getAllPayments
} = require('./payment.controller');

// Маршрути для користувачів
router.post('/', verifyToken, createPayment);
router.post('/confirm', verifyToken, confirmPayment);
router.patch('/cancel/:transactionId', verifyToken, cancelPayment);
router.get('/my', verifyToken, getUserPayments);
router.get('/details/:transactionId', verifyToken, getPaymentDetails);

// Маршрути для адміністраторів
router.get('/admin/all', adminAuth, getAllPayments);
router.get('/admin/stats', adminAuth, getPaymentsStats);
router.post('/admin/refund/:transactionId', adminAuth, refundPayment);

module.exports = router;