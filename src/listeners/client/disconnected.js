module.exports = {
  name: 'disconnected',
  execute: async (client) => {
    client.logger.warn('Bot has been disconnected.');
  },
};
