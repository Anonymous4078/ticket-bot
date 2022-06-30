const {
  bold,
  EmbedBuilder,
  underscore,
  time,
  TimestampStyles,
} = require('discord.js');
const ms = require('pretty-ms');

module.exports = {
  name: 'guildCreate',
  execute: async (client, guild) => {
    const owner = await guild.fetchOwner();

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle('Joined a new server')
      .setThumbnail(guild.iconURL())
      .setTimestamp()
      .addFields([
        {
          name: `${underscore('Server Information :')}`,
          value: `
${bold('Name:')} ${guild.name} 
${bold('ID:')} ${guild.id} 
${bold('Members:')} ${guild.memberCount}
${bold('Created At:')} ${time(
            Math.round(guild.createdTimestamp / 1000),
            TimestampStyles.LongDateTime,
          )} ( ${ms(new Date() - guild.createdTimestamp, {
            verbose: true,
            showMilliseconds: false,
          })} ago )`,
          inline: true,
        },
        {
          name: `${underscore('Owner Information :')}`,
          value: `
${bold('Owner:')} ${owner.user.tag} 
${bold('Owner ID:')} ${owner.id}
`,
          inline: true,
        },
      ]);
    const channel = client.channels.cache.get(client.config.logChannelId);
    channel.send({ embeds: [embed] });
  },
};
