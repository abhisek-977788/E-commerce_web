const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus, getDashboardStats } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.use(protect);
router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/admin/all', admin, getAllOrders);
router.get('/admin/stats', admin, getDashboardStats);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.put('/admin/:id/status', admin, updateOrderStatus);

module.exports = router;
