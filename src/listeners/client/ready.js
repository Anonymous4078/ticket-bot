const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute: async (client) => {
    await client.application.fetch();

    client.logger.info(`Logged in as ${client.user.tag}.`);

    client.user.setPresence({
      activities: [
        {
          name: 'slash commands',
          type: ActivityType.Listening,
        },
      ],
    });
  },
};
