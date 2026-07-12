const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity cannot be less than 1.']
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: false });

const cartSchema = new Schema({
  items: [cartItemSchema],
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);