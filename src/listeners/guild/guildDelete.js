const {
  bold,
  EmbedBuilder,
  underscore,
  time,
  TimeStampStyles,
} = require('discord.js');

module.exports = {
  name: 'guildDelete',
  execute: async (client, guild) => {
    const owner = await guild.fetchOwner();

    const embed = new EmbedBuilder()
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
            guild.createdTimestamp,
            TimeStampStyles.LongDateTime,
          )} ( ${time(guild.createdTimestamp, TimeStampStyles.RelativeTime)} )`,
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
