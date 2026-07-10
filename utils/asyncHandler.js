// utils/asyncHandler.js
// Catches unhandled promise rejections and passes them directly to the central error handler
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};