router.post('/items', async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const qtyToAdd = Number(quantity);

        if (!qtyToAdd || qtyToAdd <= 0) {
            return res.status(400).json({ message: 'Quantity must be greater than 0' });
        }

        // 1. Check Product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product must exist' });
        }

        // Fetch or initialize the cart document
        let cart = await Cart.findOne();
        if (!cart) {
            cart = new Cart({ items: [], totalPrice: 0 });
        }

        // 2. Find matching items to check cumulative quantity
        const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        const currentInCartQty = existingItemIndex > -1 ? cart.items[existingItemIndex].quantity : 0;

        // FIX: Compare cumulative quantities against actual warehouse inventory
        if (product.stock < (currentInCartQty + qtyToAdd)) {
            return res.status(400).json({ 
                message: `Insufficient stock. You already have ${currentInCartQty} in cart, and only ${product.stock} are available.` 
            });
        }

        const productPrice = product.price;

        if (existingItemIndex > -1) {
            // Increase quantity and update cached price snapshot to latest database entry
            cart.items[existingItemIndex].quantity += qtyToAdd;
            cart.items[existingItemIndex].price = productPrice; 
        } else {
            // Add new item to array
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