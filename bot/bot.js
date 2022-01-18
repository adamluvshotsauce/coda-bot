// Run dotenv
require('dotenv').config();

const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');

const commandFiles = fs
    .readdirSync('./commands')
    .filter((file) => file.endsWith('.js'));

const eventFiles = fs
    .readdirSync('./events')
    .filter((file) => file.endsWith('.js'));

// instaniate client and attach commands
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();

for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    // add command into the collection indexed by command name
    client.commands.set(command.data.name, command);
}

for (const file of eventFiles) {
    const event = require(`../events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// login with client token
client.login(process.env.DISCORD_TOKEN);
