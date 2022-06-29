const { readdirSync } = require('node:fs');
const {
  Client,
  Collection,
  GatewayIntentBits,
  Options,
} = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const http = require('node:http');
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions],
  failIfNotExists: true,
  makeCache: Options.cacheWithLimits({
    BaseGuildEmojiManager: 0,
    GuildInviteManager: 0,
    GuildStickerManager: 0,
    GuildScheduledEventManager: 0,
    PresenceManager: 0,
    StageInstanceManager: 0,
    VoiceStateManager: 0,
  }),
});
client.interactions = new Collection();
client.commands = new Collection();
client.cooldowns = new Collection();
client.config = require('./config');
client.logger = require('./logger');
const mongo = require('./mongo');
require('dotenv').config();

const server = http.createServer((req, res) => {
  res.writeHead(200).end('Express server is running.');
});

server.listen(3000, () => {
  client.logger.info('Express server is ready.');
});

readdirSync('./src/listeners/').map((dir) => {
  const eventFiles = readdirSync(`./src/listeners/${dir}/`).filter((file) =>
    file.endsWith('.js'),
  );

  eventFiles.map((file) => {
    const event = require(`../src/listeners/${dir}/${file}`);
    client.logger.info(`Event - Loaded ${event.name}`);
    client.on(event.name, (...args) => event.execute(client, ...args));
  });
});

readdirSync('./src/interactions/').forEach((dir) => {
  const interactionFiles = readdirSync(`./src/interactions/${dir}/`).filter(
    (file) => file.endsWith('.js'),
  );
  for (const file of interactionFiles) {
    const interaction = require(`../src/interactions/${dir}/${file}`);
    client.logger.info(`Interaction - Loaded ${interaction.id}`);
    client.interactions.set(interaction.id, interaction);
  }
});

const commands = [];
readdirSync('./src/commands/').forEach((dir) => {
  const commandFiles = readdirSync(`./src/commands/${dir}/`).filter((file) =>
    file.endsWith('.js'),
  );
  for (const file of commandFiles) {
    const command = require(`../src/commands/${dir}/${file}`);
    commands.push(command.data);
    client.logger.info(`Command - Loaded ${command.data.name}`);
    client.commands.set(command.data.name, command);
  }
});

const rest = new REST({ version: '10' }).setToken(
  process.env.DISCORD_BOT_TOKEN,
);
(async () => {
  await rest
    .put(Routes.applicationCommands(client.config.clientId), {
      body: commands,
    })
    .catch((error) => client.logger.error(error))
    .finally(client.logger.info('Registered application commands.'));
})();

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection: ', reason, promise);
});

process.on('uncaughtException', (err) => {
  console.log('Uncaught Error: ', err);
});

mongo.init();
client.login(process.env.DISCORD_BOT_TOKEN);
