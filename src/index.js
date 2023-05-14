require('dotenv').config();
const mongoose = require('mongoose');
const { Client, IntentsBitField, ActivityType } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('ready', () => {
  console.log();
  client.user.setActivity({
    name: 'Making tea for my Master.',
    type: ActivityType.Streaming,
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',

  })
});

(async () => {
  mongoose.set('strictQuery', false);
  await mongoose.connect(process.env.MONGODB_URI).catch((e) => {
    throw new Error(`Error connecting to DB: ${e}`);
  });

  eventHandler(client);
  client.login(process.env.TOKEN);
})();
