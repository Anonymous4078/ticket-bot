module.exports = {
  name: 'error',
  execute: async (client, error) => {
    client.logger.error(error);
  },
};
