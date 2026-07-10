const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private (Hardcoded user for now, or via auth middleware)
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    
    // 1. Hardcode a userId for testing since auth isn't fully set up yet
    const userId = "64f1234567890123456789ab"; 

    // 2. Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 3. Find or create the user's cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [], totalPrice: 0 });
    }

    // 4. Check if the product is already in the cart
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      // Product exists, update quantity
      cart.items[itemIndex].quantity += Number(quantity);
    } else {
      // Product doesn't exist, push new item
      cart.items.push({ productId, quantity: Number(quantity) });
    }

    // 5. Calculate total price dynamically
    // We need to fetch prices for all items in the cart to ensure accuracy
    let total = 0;
    for (const item of cart.items) {
      const itemProduct = await Product.findById(item.productId);
      if (itemProduct) {
        total += itemProduct.price * item.quantity;
      }
    }
    cart.totalPrice = total;

    // 6. Save the cart
    await cart.save();
    res.status(200).json({ success: true, data: cart });

  } catch (error) {
    next(error);
  }
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    const userId = "64f1234567890123456789ab"; // Matching testing ID

    // Find cart and populate the product details inside the items array
    const cart = await Cart.findOne({ userId }).populate('items.productId', 'name price image');

    if (!cart) {
      return res.status(200).json({ success: true, data: { items: [], totalPrice: 0 } });
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};