const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Add item to cart
// @route   POST /api/cart/items
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const qtyToAdd = Number(quantity);

        if (!qtyToAdd || qtyToAdd <= 0) {
            return res.status(400).json({ message: 'Quantity must be greater than 0' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product must exist' });
        }

        let cart = await Cart.findOne();
        if (!cart) {
            cart = new Cart({ items: [], totalPrice: 0 });
        }

        const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        const currentInCartQty = existingItemIndex > -1 ? cart.items[existingItemIndex].quantity : 0;

        if (product.stock < (currentInCartQty + qtyToAdd)) {
            return res.status(400).json({ 
                message: `Insufficient stock. You already have ${currentInCartQty} in cart, and only ${product.stock} are available.` 
            });
        }

        const productPrice = product.price;

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += qtyToAdd;
            cart.items[existingItemIndex].price = productPrice; 
        } else {
            cart.items.push({
                product: productId,
                quantity: qtyToAdd,
                price: productPrice
            });
        }

        cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

        await cart.save();
        return res.status(200).json(cart);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update quantity
// @route   PATCH /api/cart/items/:productId
exports.updateCartItem = async (req, res) => {
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

        if (newQty === 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            const product = await Product.findById(productId);
            if (!product || product.stock < newQty) {
                return res.status(400).json({ message: 'Insufficient stock available' });
            }
            cart.items[itemIndex].quantity = newQty;
        }

        cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

        await cart.save();
        return res.status(200).json(cart);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Remove single item
// @route   DELETE /api/cart/items/:productId
exports.removeItem = async (req, res) => {
    try {
        const { productId } = req.params;

        let cart = await Cart.findOne();
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

        await cart.save();
        return res.status(200).json(cart);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    View cart with populated products
// @route   GET /api/cart
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne().populate('items.product');
        if (!cart) {
            return res.status(200).json({ items: [], totalPrice: 0 });
        }
        return res.status(200).json(cart);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
exports.clearCart = async (req, res) => {
    try {
        let cart = await Cart.findOne();
        if (!cart) {
            return res.status(200).json({ items: [], totalPrice: 0 });
        }

        cart.items = [];
        cart.totalPrice = 0;

        await cart.save();
        return res.status(200).json(cart);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};