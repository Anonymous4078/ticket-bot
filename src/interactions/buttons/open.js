const { EmbedBuilder } = require('discord.js');
const ticketModel = require('../../models/ticket');
const configModel = require('../../models/guildConfig');

module.exports = {
  id: 'open',
  interactionRun: async (interaction) => {
    const { client, guild, channel, member } = interaction;

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

    const ticket = await ticketModel.findOne({ channelId: channel.id });

    if (!ticket.closed) {
      return interaction.reply({
        content: `${client.config.emojis.cross} | This ticket hasn't been closed.`,
        ephemeral: true,
      });
    }

    await channel.permissionOverwrites.create(ticket.userId, {
      ViewChannel: true,
      type: 'member',
    });

    await channel.setName(`ticket-${ticket.index.toString().padStart(4, '0')}`);

    const message = await channel.messages.fetch(ticket.controlPanelMessageId);
    await message.delete();

    const embed = new EmbedBuilder()
      .setDescription(
        `🔓 Ticket opened by ${interaction.user.toString()} ( ID: ${
          interaction.user.id
        } )`,
      )
      .setColor('Blurple');

    await channel.send({ embeds: [embed] });

    await ticketModel.findOneAndUpdate(
      { channelId: channel.id },
      { closed: false, controlPanelMessageId: undefined },
      { omitUndefined: true },
    );
  },
};
