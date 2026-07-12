const Product = require('../models/Product');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

exports.getAllProducts = asyncHandler(async (req, res, next) => {
  let queryObj = {};

  if (req.query.category) {
    queryObj.category = req.query.category;
  }

  if (req.query.inStock) {
    queryObj.inStock = req.query.inStock === 'true';
  }

  if (req.query.minPrice || req.query.maxPrice) {
    queryObj.price = {};
    if (req.query.minPrice) queryObj.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) queryObj.price.$lte = Number(req.query.maxPrice);
  }

  if (req.query.search) {
    queryObj.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }
 
  const products = await Product.find(queryObj).populate('category', 'name description');

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: { products }
  });
});

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

exports.createProduct = asyncHandler(async (req, res, next) => {
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

exports.updateProduct = asyncHandler(async (req, res, next) => {
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