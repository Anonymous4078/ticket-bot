module.exports = {
  name: 'warn',
  execute: async (client, warning) => {
    client.logger.warn(warning);
  },
};
