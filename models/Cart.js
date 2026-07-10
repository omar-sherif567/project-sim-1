const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product', // References your existing Product model
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity cannot be less than 1.']
  },
  price: {
    type: Number,
    required: true // Caches the price from the database at the time of adding
  }
}, { _id: false }); // Prevents Mongoose from generating a separate _id for each cart item object

const cartSchema = new Schema({
  items: [cartItemSchema], // Array of objects containing product, quantity, and price
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true // Automatically handles createdAt and updatedAt fields
});

module.exports = mongoose.model('Cart', cartSchema);