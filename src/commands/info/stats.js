const { bold, EmbedBuilder, version } = require('discord.js');
const { cpus } = require('node:os');
const ms = require('pretty-ms');

module.exports = {
  data: {
    name: 'stats',
    description: 'Shows statistics of the bot.',
  },
  chatInputRun: async (interaction) => {
    await interaction.deferReply();

    const { client } = interaction;
    const { heapUsed, heapTotal } = process.memoryUsage();

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
${bold('Uptime')} : ${ms(client.uptime, {
          verbose: true,
          showMilliseconds: false,
        })}
${bold('Total heap')} : ${(heapTotal / 1024 / 1024).toFixed(2)}MB
${bold('Heap used')} : ${(heapUsed / 1024 / 1024).toFixed(2)}MB
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
