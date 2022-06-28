const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  guildId: String,
  ticketCount: { type: Number, default: 0 },
  config: {
    channelId: String,
    messageId: String,
    categoryId: String,
    staffRoleIds: [String],
    ticketLimit: { type: Number, default: 1 },
  },
  blackListedRoleIds: [String],
});

module.exports = mongoose.model('guild_config', Schema);
