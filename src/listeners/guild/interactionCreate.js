const prettyMilliseconds = require('pretty-ms');
const { Collection } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  execute: async (client, interaction) => {
    const { user } = interaction;
    if (interaction.isButton()) {
      const component = client.interactions.get(interaction.customId);
      if (!component) return;

      component.interactionRun(interaction);
    } else if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) return;

      if (
        !interaction.member.permissions.has(command.requiredUserPermissions)
      ) {
        return interaction.reply(
          `${client.config.emojis.cross} | You don't have permissons to use this command.`,
        );
      }

      const { cooldowns } = client;

      if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
      }

      const now = Date.now();
      const timestamps = cooldowns.get(command.data.name);
      const cooldownAmount = command.cooldown * 1000;

      if (timestamps.has(user.id)) {
        const expirationTime = timestamps.get(user.id) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return interaction.reply(
            `🕐 | Please wait ${prettyMilliseconds(timeLeft, {
              verbose: true,
            })} before reusing this command.`,
          );
        }
      }

      timestamps.set(user.id, now);
      setTimeout(() => timestamps.delete(user.id), cooldownAmount);

      command.chatInputRun(interaction).catch((err) => {
        client.logger.error(err);
        if (interaction.replied) {
          interaction.editReply(
            '⚠️ | An error occurred while executing this command.',
          );
        } else {
          interaction.reply({
            content: '⚠️ | An error occurred while executing this command.',
            ephemeral: true,
          });
        }
      });
    }
  },
};
