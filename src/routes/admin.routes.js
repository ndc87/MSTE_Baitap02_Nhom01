const express = require('express');
const router = express.Router();
const adminManageController = require('../controllers/adminManageController');
const { verifyToken } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

// Protect all routes in this file
router.use(verifyToken);
router.use(authorize('admin'));

// --- PRODUCTS API ---
router.post('/products', adminManageController.createProduct);
router.put('/products/:id', adminManageController.updateProduct);
router.delete('/products/:id', adminManageController.deleteProduct);

// --- ORDERS API ---
router.get('/orders', adminManageController.getAllOrders);
router.put('/orders/:id/status', adminManageController.updateOrderStatus);
router.post('/orders/:id/cancel-request', adminManageController.handleCancelRequest);

module.exports = router;
