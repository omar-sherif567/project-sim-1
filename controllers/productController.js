// controllers/productController.js
const Product = require('../models/Product');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Get all products (With full search filtering, ranges, and check bounds)
// @route   GET /api/products
exports.getAllProducts = asyncHandler(async (req, res, next) => {
  // Build dynamic filtering criteria map object
  let queryObj = {};

  // Exact Match filtering for categories
  if (req.query.category) {
    queryObj.category = req.query.category;
  }

  // Stock status true/false casting check
  if (req.query.inStock) {
    queryObj.inStock = req.query.inStock === 'true';
  }

  // Range tracking boundary limits (minPrice & maxPrice calculation parsing)
  if (req.query.minPrice || req.query.maxPrice) {
    queryObj.price = {};
    if (req.query.minPrice) queryObj.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) queryObj.price.$lte = Number(req.query.maxPrice);
  }

  // Partial string pattern lookup search parameter (Regex match across fields)
  if (req.query.search) {
    queryObj.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Execute populated Mongo cursor lookups 
  const products = await Product.find(queryObj).populate('category', 'name description');

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: { products }
  });
});

// @desc    Get product by ID (With model field population populated)
// @route   GET /api/products/:id
exports.getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('category', 'name description');
  
  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { product }
  });
});

// @desc    Create a product (With explicit Category ID system existence checking)
// @route   POST /api/products
exports.createProduct = asyncHandler(async (req, res, next) => {
  // Check if target category ID actually exists in the DB first
  const targetCategoryExists = await Category.findById(req.body.category);
  if (!targetCategoryExists) {
    return next(new AppError('Category ID provided does not match any current records', 404));
  }

  const newProduct = await Product.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { product: newProduct }
  });
});

// @desc    Update a product by ID
// @route   PATCH /api/products/:id
exports.updateProduct = asyncHandler(async (req, res, next) => {
  // Verify category ID constraint check if updating relationship path arrays
  if (req.body.category) {
    const catCheck = await Category.findById(req.body.category);
    if (!catCheck) return next(new AppError('Target category parameter does not exist', 404));
  }

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { product }
  });
});

// @desc    Delete a product by ID
// @route   DELETE /api/products/:id
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});