import debug from 'debug';
import { Client, Guild, Intents } from 'discord.js';

export function serializeServer(server: Guild): string {
  if ('name' in server) {
    const createdAt = new Date(server.createdAt).toISOString();
    return `${server.name} (${server.id}) [${server.memberCount}] ${createdAt} by <@${server.ownerId}>`;
  }
  return `${server.id}`;
}

const logger = debug('bot');
const log = logger.extend('log');
const warn = logger.extend('warn');
const error = logger.extend('error');

const bot = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

bot.on('warn', (message) => warn(`Shard ${bot.shard}: ${message}`));
bot.on('error', (message) => error(`Shard ${bot.shard}: ${message}`));
bot.on('shardReady', (shard) => log(`Shard ${shard} ready`));
bot.on('shardDisconnect', (shard) => log(`Shard ${shard} disconnected`));
bot.on('guildCreate', (guild) => log(`Guild create: ${serializeServer(guild)}`));
bot.on('guildDelete', (guild) => log(`Guild delete: ${serializeServer(guild)}`));
bot.on('ready', () => log(`Logged in as ${bot.user?.tag} - ${bot.user?.id}`));
bot.once('ready', async () => {
  const command = await bot.application?.commands.create({
    name: 'test',
    description: 'Verify the bot is running with a link to the documentation.',
  });

  log(command);
});

bot.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  if (interaction.commandName === 'test') {
    await interaction.reply(
      `My documentation can be found at a private GitHub URL.\nRevision: ${process.env.BOT_REVISION}.`
    );
  }
});

export default bot;
