const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require('discord.js');
const collection = require('../../models/guildConfig');

module.exports = {
  data: {
    name: 'unblacklist',
    description: 'Unblacklist a role from creating tickets.',
    type: ApplicationCommandType.ChatInput,
    options: [
      {
        name: 'role',
        description: 'The role to blacklist.',
        type: ApplicationCommandOptionType.Role,
        required: true,
      },
    ],
    dm_permission: false,
  },
  requiredUserPermissions: ['ManageGuild'],
  chatInputRun: async (interaction) => {
    const { client, guild } = interaction;
    const role = interaction.options.getRole('role');
    const data = await collection.findOne({
      guildId: guild.id,
    });

    if (role.managed) {
      return interaction.reply({
        content: `${client.config.emojis.cross} | You cannot unblacklist a integrated role.`,
        ephemeral: true,
      });
    }

    if (!data.blackListedRoleIds.includes(role.id)) {
      return interaction.reply({
        content: `${client.config.emojis.cross} | That role isn't blacklisted.`,
        ephemeral: true,
      });
    }

    await collection.findOneAndUpdate(
      { guildId: guild.id },
      { $pull: { blackListedRoleIds: role.id } },
      { upsert: true },
    );

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setDescription(
        `${
          client.config.emojis.tick
        } | Successfully unblacklisted ${role.toString()}.`,
      );

    await interaction.reply({ embeds: [embed] });
  },
};
