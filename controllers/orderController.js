const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Checkout current cart items and create an order
// @route   POST /api/orders/checkout
exports.checkout = async (req, res) => {
    try {
        const { shippingAddress } = req.body;
        if (!shippingAddress) {
            return res.status(400).json({ message: 'Shipping address is required' });
        }

        // 1. Fetch current cart and populate product details
        const cart = await Cart.findOne().populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const orderItems = [];

        // 2. Validate stock for all items
        for (const item of cart.items) {
            const product = item.product;
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient stock for product: ${product ? product.name : 'Unknown'}` 
                });
            }
            
            // Save name & price snapshot at time of checkout
            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity
            });
        }

        // 3. Deduct stock balances from database
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity }
            });
        }

        // 4. Generate unique order number
        const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

        // 5. Create the Order document
        const order = new Order({
            orderNumber,
            items: orderItems,
            totalPrice: cart.totalPrice,
            shippingAddress
        });

        await order.save();

        // 6. Clear out the source cart
        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();

        return res.status(201).json(order);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
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

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
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