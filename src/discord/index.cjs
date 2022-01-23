const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Intents } = require('discord.js');
const createCommands = require('./createCommands.cjs');
const commands = require('./commands/index.cjs');

async function discord(AL, credentials, scripts, characters, party){
  const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
  const rest = new REST({ version: '9' }).setToken(credentials.token);

  try {
    console.log('Started refreshing application (/) commands.');
    const commands = createCommands(scripts, characters, party.config);

    await rest.put(
      Routes.applicationGuildCommands(credentials.clientID, credentials.guildID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }

  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    try{
      // Merchant specific commands
      if(interaction?.commandName == "merchant" && interaction?.options?.['_subcommand'] == "run"){
        return await commands[interaction.commandName]['run'](AL, interaction, characters, client);
      }
      // Whispering or saying
      if(["whisper", "say"].includes(interaction.commandName)){
        await commands[interaction.commandName](AL, interaction, characters, client);
      }
      // Party commands
      if(interaction?.commandName == "party"){
        const {name} = interaction?.options?.['_hoistedOptions']?.[0] || {};
        if(!name) return await interaction.reply("Invalid command");
        await commands[interaction.commandName][name](AL, interaction, party, characters, client);
      }

    }catch(error) {
      console.log("Discord Error", error)
    }
  });

  client.login(credentials.token);

  return Promise.resolve(client);
}


module.exports = {
  discord
}