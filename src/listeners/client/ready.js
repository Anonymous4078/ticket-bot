const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute: async (client) => {
    client.logger.info(`Logged in as ${client.user.tag}.`);

    client.user.setPresence({
      activities: [
        {
          name: `${client.guilds.cache.size} servers`,
          type: ActivityType.Watching,
        },
      ],
    });
  },
};
