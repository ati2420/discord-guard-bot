const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ Bot logged in as ${client.user.tag}`);

    // Register Slash Commands
    const commands = [];
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if (command.data) {
        commands.push(command.data.toJSON());
      }
    }

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
      console.log('🔄 Registering slash commands...');
      await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
      console.log('✅ Slash commands registered');
    } catch (error) {
      console.error('❌ Error registering commands:', error);
    }
  }
};