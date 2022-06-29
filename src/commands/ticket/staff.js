const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require('discord.js');
const collection = require('../../models/guildConfig');

module.exports = {
  data: {
    name: 'staff',
    description: 'Add or remove a role as the ticket staff.',
    type: ApplicationCommandType.ChatInput,
    options: [
      {
        name: 'add',
        description: 'Add a role as the ticket staff.',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'role',
            description: 'The role to add to the staff',
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
      },
      {
        name: 'remove',
        description: 'Remove a role from the ticket staff.',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'role',
            description: 'The role to add to the staff',
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
      },
    ],
    dm_permission: false,
  },
  requiredUserPermissions: ['Administrator'],

  chatInputRun: async (interaction) => {
    await interaction.deferReply();

    const { client, guild } = interaction;
    const subCommand = interaction.options.getSubcommand();
    if (subCommand === 'add') {
      const role = interaction.options.getMentionable('role');

      const data = await collection.findOne({
        guildId: guild.id,
      });

      if (role.managed) {
        return interaction.editReply(
          `${client.config.emojis.cross} | You cannot add a integrated role to the staff roles.`,
        );
      }

      if (data.config.staffRoleIds.includes(role.id)) {
        return interaction.editReply(
          `${client.config.emojis.cross} | That role is already a staff role.`,
        );
      }

      await collection.findOneAndUpdate(
        { guildId: guild.id },
        { $push: { 'config.staffRoleIds': role.id } },
      );

      const embed = new EmbedBuilder()
        .setColor('Blurple')
        .setDescription(
          `${
            client.config.emojis.tick
          } | Successfully added ${role.toString()} to the staff role.`,
        );

      await interaction.editReply({ embeds: [embed] });
    } else {
      const role = interaction.options.getMentionable('role');
      const data = await collection.findOne({
        guildId: guild.id,
      });

      if (role.managed) {
        return interaction.editReply(
          `${client.config.emojis.cross} | You cannot remove a integrated role from the staff roles.`,
        );
      }

      if (!data.config.staffRoleIds.includes(role.id)) {
        return interaction.editReply(
          `${client.config.emojis.cross} | That role is not a staff role.`,
        );
      }

      await collection.findOneAndUpdate(
        { guildId: guild.id },
        { $pull: { 'config.staffRoleIds': role.id } },
      );

      const embed = new EmbedBuilder()
        .setColor('Blurple')
        .setDescription(
          `${
            client.config.emojis.tick
          } | Successfully removed ${role.toString()} from the staff role.`,
        );

      await interaction.editReply({ embeds: [embed] });
    }
  },
};
