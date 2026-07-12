exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('No product found with that ID reference!', 404));
    }

    let cart = await Cart.findOne();
    if (!cart) {
      cart = new Cart({ items: [], totalPrice: 0 });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    const targetQuantity = Number(quantity) || 1;

    if (existingItemIndex > -1) {
      // Use += if your front-end button is an "Add (+1)" button, 
      // or change to = if the front-end sends the final absolute value.
      cart.items[existingItemIndex].quantity += targetQuantity;
      cart.items[existingItemIndex].price = product.price; // Caches latest price
    } else {
      cart.items.push({
        product: productId,
        quantity: targetQuantity,
        price: product.price
      });
    }

    // Double-check the total calculations using the fresh product price snapshot
    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    await cart.save();

    res.status(200).json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};