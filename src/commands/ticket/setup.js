const {
  ActionRowBuilder,
  ApplicationCommandType,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
} = require('discord.js');
const collection = require('../../models/guildConfig.js');

module.exports = {
  data: {
    name: 'setup',
    description: 'Setups the bot',
    type: ApplicationCommandType.ChatInput,
    options: [
      {
        name: 'create',
        description: 'Updates the server configuration.',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'channel',
            description: 'The channel to set as the ticket channel.',
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText],
            required: true,
          },
          {
            name: 'category',
            description: 'The category to set as the ticket category.',
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildCategory],
            required: true,
          },
          {
            name: 'ticket_limit',
            description: 'Maximum number of tickets a user can create.',
            type: ApplicationCommandOptionType.Number,
            required: true,
            min_value: 1,
          },
        ],
      },
    ],
    dm_permission: false,
  },
  requiredUserPermissions: ['ManageGuild'],
  chatInputRun: async (interaction) => {
    await interaction.deferReply();

    const channel = interaction.options.getChannel('channel');
    const category = interaction.options.getChannel('category');
    const ticket_limit = interaction.options.getNumber('ticket_limit');
    const data = await collection.findOne({ guildId: interaction.guild.id });

    if (data) {
      const channel = await interaction.client.channels.fetch(
        data.config.channelId,
      );
      const message = await channel.messages.fetch(data.config.messageId);
      await message.delete();
    }

    const embed = new EmbedBuilder()
      .setTitle('Tickets')
      .setDescription('To create a ticket, click the 📩 button.')
      .setTimestamp()
      .setColor('Blurple');

    const row = new ActionRowBuilder().addComponents([
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel('Create a ticket')
        .setEmoji({ name: '📩' })
        .setCustomId('create'),
    ]);

    const message = await channel.send({
      embeds: [embed],
      components: [row],
    });

    await collection.findOneAndUpdate(
      { guildId: interaction.guild.id },
      {
        config: {
          channelId: channel.id,
          messageId: message.id,
          categoryId: category.id,
          ticketLimit: ticket_limit,
        },
      },
      { upsert: true },
    );

    await interaction.editReply(
      `${interaction.client.config.emojis.tick} | Successfully updated the server configuration.`,
    );
  },
};
