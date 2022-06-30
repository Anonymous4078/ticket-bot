const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  ChannelType,
} = require('discord.js');
const configModel = require('../../models/guildConfig');
const ticketModel = require('../../models/ticket');

module.exports = {
  data: {
    name: 'remove',
    description: 'Remove a user from your ticket',
    type: ApplicationCommandType.ChatInput,
    options: [
      {
        name: 'user',
        description: 'The user whom you want to remove.',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'ticket',
        description: 'The ticket channel.',
        type: ApplicationCommandOptionType.Channel,
        channel_types: [ChannelType.GuildText],
        required: true,
      },
    ],

    dm_permission: false,
  },
  chatInputRun: async (interaction) => {
    const { client } = interaction;
    const member = interaction.options.getMember('user');
    const channel = interaction.options.getChannel('ticket');

    if (member.user.bot) {
      return interaction.reply({
        content: `${client.config.emojis.cross} | You cannot remove a bot to a ticket channel.`,
        ephemeral: true,
      });
    }

    const data = await configModel.findOne({ guildId: interaction.guild.id });
    const ticket = await ticketModel.findOne({ channelId: channel.id });

    if (!ticket) {
      return interaction.reply({
        content: `${
          client.config.emojis.cross
        } | ${channel.toString()} is not a ticket channel.`,
        ephemeral: true,
      });
    }

    if (
      interaction.user.id !== ticket.userId ||
      interaction.member.roles.cache.hasAny(data.config?.staffRoleIds) ||
      !interaction.member.permissions.has('ManageChannels')
    ) {
      return interaction.reply({
        content: `${client.config.emojis.cross} | You are not creator of that ticket or the staff.`,
        ephemeral: true,
      });
    }

    await channel.permissionOverwrites.edit(member, {
      ViewChannel: false,
    });

    await interaction.reply(
      `${client.config.emojis.tick} | Removed ${
        member.user.tag
      } from ${channel.toString()}.`,
    );
  },
};
