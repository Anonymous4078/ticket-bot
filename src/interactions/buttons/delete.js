const ticketModel = require('../../models/ticket');
const configModel = require('../../models/guildConfig');
const { setTimeout } = require('node:timers/promises');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  id: 'delete',
  interactionRun: async (interaction) => {
    const { client, guild, channel, member } = interaction;

    if (!guild.members.me.permissions.has('ManageChannels')) {
      return interaction.reply({
        content: `${client.config.emojis.cross} | I need Manage Channels permission in this server to delete this ticket.`,
        ephemeral: true,
      });
    }

    if (!guild.members.me.permissionsIn(channel).has('ManageChannels')) {
      return interaction.reply({
        content: `${client.config.emojis.cross} | I need Manage Channels permission in this channel to delete this ticket.`,
        ephemeral: true,
      });
    }
    const data = await configModel.findOne({ guildId: guild.id });

    if (
      (data.staffRoleIds?.length &&
        !member.roles.cache.hasAny(...data.config.staffRoleIds)) ||
      !member.permissions.has('ManageChannels')
    ) {
      return interaction.reply({
        content: `${client.config.emojis.cross} | You must have Manage Channels permission or one of the staff roles.`,
        ephemeral: true,
      });
    }

    await ticketModel.findOneAndDelete({ channelId: channel.id });

    const embed = new EmbedBuilder()
      .setDescription('Ticket will be deleted in 5 seconds.')
      .setColor('Red');

    await channel.send({ embeds: [embed] });

    await setTimeout(5000);
    await channel.delete();
  },
};
