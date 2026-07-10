const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// ==========================================
// STEP 2: ADD ITEM TO CART
// POST /api/cart/items
// ==========================================
router.post('/items', async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const qtyToAdd = Number(quantity);

        // 1. Check Product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product must exist' });
        }

        // 2. Check Stock
        if (product.stock < qtyToAdd) {
            return res.status(400).json({ message: 'Must have stock' });
        }

        // Fetch or initialize the cart document
        let cart = await Cart.findOne();
        if (!cart) {
            cart = new Cart({ items: [], totalPrice: 0 });
        }

        // 3. Price comes directly from database, not req.body
        const productPrice = product.price;

        // 4. If exists in cart -> increase quantity
        const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += qtyToAdd;
        } else {
            // Otherwise -> Add new item to array
            cart.items.push({
                product: productId,
                quantity: qtyToAdd,
                price: productPrice
            });
        }

        // 5. Recalculate totalPrice after every change
        cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

        await cart.save();
        return res.status(200).json(cart);

    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ==========================================
// STEP 3: UPDATE & REMOVE ITEMS
// ==========================================

// PATCH /api/cart/items/:productId -> Update quantity
router.patch('/items/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        const newQty = Number(quantity);

        if (newQty < 0) {
            return res.status(400).json({ message: 'No negative quantity allowed' });
        }

        let cart = await Cart.findOne();
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // If quantity reaches 0 -> item removed automatically
        if (newQty === 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            // Check stock from database before updating quantity
            const product = await Product.findById(productId);
            if (!product || product.stock < newQty) {
                return res.status(400).json({ message: 'Insufficient stock available' });
            }
            cart.items[itemIndex].quantity = newQty;
        }

        // totalPrice updates after every change
        cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

        await cart.save();
        return res.status(200).json(cart);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE /api/cart/items/:productId -> Remove single item
router.delete('/items/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        let cart = await Cart.findOne();
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.product.toString() !== productId);

        // totalPrice updates after every change
        cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

        await cart.save();
        return res.status(200).json(cart);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ==========================================
// STEP 4: VIEW & CLEAR CART
// ==========================================

// GET /api/cart -> View cart with populated products
router.get('/', async (req, res) => {
    try {
        // Uses populate() on product to retrieve full details
        let cart = await Cart.findOne().populate('items.product');
        
        // If empty -> return empty cart structure, NOT a 404 error
        if (!cart) {
            return res.status(200).json({ items: [], totalPrice: 0 });
        }

        return res.status(200).json(cart);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE /api/cart -> Clear entire cart
router.delete('/', async (req, res) => {
    try {
        let cart = await Cart.findOne();
        if (!cart) {
            return res.status(200).json({ items: [], totalPrice: 0 });
        }

        // Clears cart & resets totalPrice to 0
        cart.items = [];
        cart.totalPrice = 0;

        await cart.save();
        return res.status(200).json(cart);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;