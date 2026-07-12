const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.checkout = async (req, res) => {
    try {
        const { shippingAddress } = req.body;
        if (!shippingAddress) {
            return res.status(400).json({ message: 'Shipping address is required' });
        }

        const cart = await Cart.findOne().populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const orderItems = [];

        for (const item of cart.items) {
            const product = item.product;
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient stock for product: ${product ? product.name : 'Unknown'}` 
                });
            }
            
            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity
            });
        }

        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity }
            });
        }

        const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

        const order = new Order({
            orderNumber,
            items: orderItems,
            totalPrice: cart.totalPrice,
            shippingAddress
        });

        await order.save();

        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();

        return res.status(201).json(order);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        return res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        await order.save();

        return res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};