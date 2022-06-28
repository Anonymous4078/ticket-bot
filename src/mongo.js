const mongoose = require('mongoose');
const logger = require('./logger');

module.exports = {
  init: async () => {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected.');
    });
    mongoose.connection.on('err', (err) => {
      logger.error(`MongoDB connection error: \n ${err.stack}`);
    });
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected.');
    });
  },
};
