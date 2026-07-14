require('dotenv').config();

if (!process.env.MONGO_URI) {
  throw new Error("Fatal Error: MONGO_URI is not defined in the environment variables!");
}

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  dbUri: process.env.MONGO_URI,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production'
};

module.exports = config;