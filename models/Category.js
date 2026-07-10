// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    slug: {
      type: String,
    },
  },
  {
    timestamps: true, // Automatically handles createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Category', categorySchema);