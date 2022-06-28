const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  channelId: String,
  userId: String,
  index: Number,
  renamedAt: Number,
  controlPanelMessageId: String,
  closed: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('tickets', schema);
