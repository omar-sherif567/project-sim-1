const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Base path configurations: /api/cart
router.route('/')
    .get(cartController.getCart)
    .delete(cartController.clearCart);

// Paths for specific items: /api/cart/items
router.route('/items')
    .post(cartController.addToCart);

router.route('/items/:productId')
    .patch(cartController.updateCartItem)
    .delete(cartController.removeItem);

module.exports = router;