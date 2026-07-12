const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.route('/')
    .get(orderController.getAllOrders);

router.route('/checkout')
    .post(orderController.checkout);

router.route('/:id')
    .get(orderController.getOrderById);

router.route('/:id/status')
    .patch(orderController.updateOrderStatus);

module.exports = router;