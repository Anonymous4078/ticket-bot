const { inlineCode } = require('discord.js');

module.exports = {
  data: {
    name: 'ping',
    description: 'Shows the ping of the bot.',
  },
  chatInputRun: async (interaction) => {
    await interaction.deferReply();
    const sent = await interaction.editReply({
      content: '🏓 | Pinging...',
      fetchReply: true,
    });

    await interaction.editReply(
      `🏓 | Pong! Websocket heartbeat : ${inlineCode(
        interaction.client.ws.ping,
      )}ms, Roundtrip latency : ${inlineCode(
        sent.createdTimestamp - interaction.createdTimestamp,
      )}ms.`,
    );
  },
};
