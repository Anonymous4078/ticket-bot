const {
  ActionRowBuilder,
  ButtonStyle,
  ButtonBuilder,
  EmbedBuilder,
} = require('discord.js');
const collection = require('../../models/ticket');

module.exports = {
  data: {
    name: 'close',
    description: 'Close a ticket',
    dm_permission: false,
  },
  chatInputRun: async (interaction) => {
    await interaction.deferReply();

    const { client, channel } = interaction;

    const data = await collection.findOne({ channelId: channel.id });

    if (data.closed) {
      return interaction.editReply(
        `${client.config.emojis.cross} | This ticket has been already closed.`,
      );
    }

    await channel.permissionOverwrites.create(data.userId, {
      ViewChannel: false,
      type: 'member',
    });

    await channel.setName(`closed-${data.index.toString().padStart(4, '0')}`);

    const embed = new EmbedBuilder()
      .setDescription(
        `🔐 Ticket closed by ${interaction.user.toString()} ( ID: ${
          interaction.user.id
        } )`,
      )
      .setColor('Blurple');

    await interaction.channel.send({ embeds: [embed] });

    const control_embed = new EmbedBuilder()
      .setTitle('Support team ticket controls')
      .setDescription(
        `• Click the 🗑️ button to delete this channel and ticket. 
• Click the 🔓 to reopen this ticket.`,
      )
      .setColor('Blurple')
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents([
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel('Delete')
        .setEmoji({ name: '🗑️' })
        .setCustomId('delete'),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel('Open')
        .setEmoji({ name: '🔓' })
        .setCustomId('open'),
    ]);

    const message = await channel.send({
      embeds: [control_embed],
      components: [row],
    });

    await collection.findOneAndUpdate(
      { channelId: channel.id },
      { closed: true, controlPanelMessageId: message.id },
    );
  },
};
