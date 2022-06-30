const ticketModel = require('../../models/ticket');
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  channelMention,
  ChannelType,
  EmbedBuilder,
  underscore,
} = require('discord.js');
const configModel = require('../../models/guildConfig');

module.exports = {
  data: {
    name: 'create',
    description: 'Create a new ticket.',
    dm_permission: false,
  },
  chatInputRun: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const { client, guild, user } = interaction;

    if (!interaction.guild.members.me.permissions.has('ManageChannels')) {
      return interaction.editReply(
        `${client.config.emojis.cross} | I need Manage Channels permission in this server to create a ticket.`,
      );
    }

    if (
      !interaction.guild.members.me
        .permissionsIn(interaction.channel)
        .has('ManageChannels')
    ) {
      return interaction.editReply(
        `${client.config.emojis.cross} | I need Manage Channels permission in this channel to create a ticket.`,
      );
    }

    const data = await configModel.findOne({ guildId: guild.id });
    if (!data) {
      return interaction.editReply(
        `${client.config.emojis.cross} | Couldn't find the setup for this server, please ask an Admin to create a setup.`,
      );
    }

    const tickets = await ticketModel.find({
      guildId: guild.id,
      userId: user.id,
      closed: false,
    });

    if (interaction.member.roles.cache.hasAny(...data.blackListedRoleIds)) {
      return interaction.editReply(
        `${client.config.emojis.cross} | You are blacklisted from creating tickets.`,
      );
    }

    if (tickets.length > data.config.ticketLimit) {
      return interaction.editReply(
        `${client.config.emojis.cross} | Ticket limit reached, you have ${
          tickets.length > 1 ? `${tickets.length} tickets` : 'a ticket'
        } opened out of ${
          data.config.ticketLimit
        } ticket allowed for this panel. \n\n${underscore(
          'Opened tickets:',
        )} \n• ${tickets
          .map((ticket) => channelMention(ticket.channelId))
          .join('\n')}`,
      );
    }

    await interaction.editReply('Creating ticket, please wait...');

    const overwrites = [
      {
        id: guild.roles.everyone.id,
        deny: ['ViewChannel'],
        type: 'role',
      },
      {
        id: client.user.id,
        allow: [
          'EmbedLinks',
          'ManageMessages',
          'ReadMessageHistory',
          'SendMessages',
          'ViewChannel',
        ],
        type: 'member',
      },
      {
        id: user.id,
        allow: [
          'AttachFiles',
          'SendMessages',
          'ViewChannel',
          'ReadMessageHistory',
        ],
        type: 'member',
      },
    ];

    data.config.staffRoleIds.map((roleId) =>
      overwrites.push({
        id: roleId,
        allow: [
          'AttachFiles',
          'ReadMessageHistory',
          'SendMessages',
          'ViewChannel',
        ],
        type: 'role',
      }),
    );

    const channel = await guild.channels.create({
      name: `ticket-${(data.ticketCount + 1).toString().padStart(4, '0')}`,
      type: ChannelType.GuildText,
      permissionOverwrites: overwrites,
      parent: data.config.categoryId,
      position: 1,
    });

    await ticketModel.create({
      guildId: guild.id,
      channelId: channel.id,
      userId: user.id,
      index: data.ticketCount + 1,
    });

    await interaction.editReply(
      `${
        client.config.emojis.tick
      } | Ticket created, please check ${channel.toString()}.`,
    );

    const embed = new EmbedBuilder()
      .setDescription(
        'Support will be available shortly. \nClick the 🔒 button to close the ticket.',
      )
      .setTimestamp()
      .setColor('Blurple');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel('Close')
        .setEmoji({ name: '🔒' })
        .setCustomId('close'),
    );

    const message = await channel.send({
      content: `Welcome ${interaction.user.toString()}`,
      embeds: [embed],
      components: [row],
    });
    await message.pin();

    await configModel.findOneAndUpdate(
      { guildId: guild.id },
      { $inc: { ticketCount: 1 } },
    );
  },
};
