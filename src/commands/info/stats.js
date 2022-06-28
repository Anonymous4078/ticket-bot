const {
  bold,
  EmbedBuilder,
  version,
  time,
  TimestampStyles,
} = require('discord.js');
const { cpus } = require('node:os');

module.exports = {
  data: {
    name: 'stats',
    description: 'Shows some statistics about the bot.',
  },
  chatInputRun: async (interaction) => {
    await interaction.deferReply();

    const { client } = interaction;
    const { heapUsed, heapTotal, rss } = process.memoryUsage();

    const owner = await client.users.fetch('852882976315277352');
    const embed = new EmbedBuilder().setColor('Blurple').addFields([
      {
        name: `${client.user.username} statistics`,
        value: `
${bold('Servers')}: ${client.guilds.cache.size}
${bold('Channels')} : ${client.channels.cache.size}
${bold('Members')} : ${client.guilds.cache.reduce(
          (acc, val) => acc + val.memberCount,
          0,
        )}
${bold('Discord.js')} : v${version}
${bold('Node.js')} : ${process.version}
${bold('Uptime')} : ${time(
          Math.round((Date.now() - client.uptime) / 1000),
          TimestampStyles.RelativeTime,
        )}
${bold('Total heap')} : ${(heapTotal / 1024 / 1024).toFixed(2)}MB
${bold('Heap used')} : ${(heapUsed / 1024 / 1024).toFixed(2)}MB
${bold('RSS')}: ${(rss / 1024 / 1024).toFixed(2)}MB
${bold('CPU Load')} : ${cpus()
          .map((c) => {
            const { user, nice, irq, sys, idle } = c.times;
            return (
              ((((user + nice + sys + irq) / idle) * 10000) / 100).toFixed(2) +
              '%'
            );
          })
          .join(' | ')}
${bold('Developer')}: ${owner.tag} (ID : ${owner.id})`,
      },
    ]);

    await interaction.editReply({ embeds: [embed] });
  },
};
