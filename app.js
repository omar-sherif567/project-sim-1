require('dotenv').config();
const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./db/connectDB');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middleware/errorHandler');

const categoryRouter = require('./routes/categoryRoutes');
const productRouter = require('./routes/productRoutes');
const cartRouter = require('./routes/cartRouter');
const orderRouter = require('./routes/orderRouter');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(mongoSanitize());

app.use('/api/categories', categoryRouter);
app.use('/api/cart', cartRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);

app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server runtime endpoint blueprint!`, 404));
});

app.use(globalErrorHandler);

const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`API System active in ${process.env.NODE_ENV} engine loop mode on port ${PORT}`);
  });
};

startServer();