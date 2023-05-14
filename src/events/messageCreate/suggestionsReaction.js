const { Client, Message, EmbedBuilder } = require('discord.js');
const { suggestionsChannel, devs } = require('../../../config.json');

/**
 *
 * @param { Client } client
 * @param { Message } message
 */
module.exports = async (client, message) => {
  if (message.author.bot) return;
  if (message.channel.id !== suggestionsChannel) return;
  if (devs.includes(message.author.id)) return;

  const embed = new EmbedBuilder()
    .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
    .setDescription(message.content)
    .setColor(0xc7a9fe);

  await message.delete();
  const reply = await message.channel.send({ embeds: [embed] });

  await reply.react('👍');
  reply.react('👎');
};
