const {
  EmbedBuilder,
  hyperlink,
  PermissionFlagsBits,
  OAuth2Scopes,
} = require('discord.js');

module.exports = {
  data: {
    name: 'invite',
    description: 'Provides the invite link of the bot.',
  },
  chatInputRun: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const { client } = interaction;

    const invite = client.generateInvite({
      scopes: [OAuth2Scopes.ApplicationsCommands, OAuth2Scopes.Bot],
      permissions: [
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.ManageRoles,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.UseExternalEmojis,
        PermissionFlagsBits.ViewChannel,
      ],
    });

    const embed = new EmbedBuilder()
      .setTitle(`Invite ${client.user.username}`)
      .setDescription(
        `• ${hyperlink(
          'Click here',
          invite,
        )} to add me to any of your servers. \n• Join ${hyperlink(
          'Support server',
          'https://discord.gg/5n3pb4PwFN',
        )} if you need support with the bot.`,
      )
      .setColor('Blurple')
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
