// app.js
require('dotenv').config(); // 1. Must be configured first
const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middleware/errorHandler');

// Import Application API Routers
const categoryRouter = require('./routes/categoryRoutes');
const productRouter = require('./routes/productRoutes');
const cartRouter = require('./routes/cartRouter');
const orderRouter = require('./routes/orderRouter');

const app = express();

// Middleware Pipeline Configuration
app.use(express.json()); // Request body JSON parsing engine pipeline
app.use(express.urlencoded({ extended: true }));

// Anti-NoSQL Query Injection sanitization layer
app.use(mongoSanitize());

// Mount Mounted Application Endpoint Routers
app.use('/api/categories', categoryRouter);
app.use('/api/cart', cartRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);

// 404 Handler for unregistered route targets matching missing paths
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server runtime endpoint blueprint!`, 404));
});

// Universal Central Application Global Error Handling Hook Pipeline (Must sit last)
app.use(globalErrorHandler);

// Connect database and turn on server listener
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`API System active in ${process.env.NODE_ENV} engine loop mode on port ${PORT}`);
  });
};S

startServer();