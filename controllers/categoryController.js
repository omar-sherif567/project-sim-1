const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

exports.getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find();
  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: { categories },
  });
});

exports.getCategoryById = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: { category },
  });
});

exports.createCategory = asyncHandler(async (req, res, next) => {
  const newCategory = await Category.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { category: newCategory },
  });
});

exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: { category },
  });
});

exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});