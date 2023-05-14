const { Client, Message, EmbedBuilder, WebhookClient } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

// OpenAI setup
const configuration = new Configuration({ apiKey: process.env.OPENAI_SECRET });
const openai = new OpenAIApi(configuration);

let webhookClient;

if (process.env.LOGS_WEBHOOK_URL) {
  webhookClient = new WebhookClient({ url: process.env.LOGS_WEBHOOK_URL });
}

const embedColor = 0xff4343;

/**
 *
 * @param {Client} client
 * @param {Message} message
 */
module.exports = async (client, message) => {
  try {
    if (message.author.bot || message.content.toLowerCase().startsWith("rpg bj")) {
      return;
    }


    const response = await openai
      .createModeration({ input: message.content })
      .catch(async (error) => {
        // Log for staff/admins using webhook (if it exists)
        if (!webhookClient) return;

        const embed = new EmbedBuilder({
          title: "Couldn't send a request to OpenAI",
          description: `A message sent in ${message.channel} couldn't be moderated due to a failed request to OpenAI.`,
          fields: [
            { name: 'Sent by', value: `${message.author.tag}\n\`${message.author.id}\`` },
            { name: 'Message', value: message.content },
            { name: 'Error', value: `${error}` },
          ],
        });

        await webhookClient.send({ embeds: [embed] });
        return;
      });

    const result = response.data.results[0];

    const trueCategories = Object.entries(result.categories)
      .filter(([category, value]) => value === true)
      .map(([category]) => category);

    if (!result.flagged) return;

    await message.delete().catch(async (error) => {
      // Log for staff/admins using webhook (if it exists)
      if (!webhookClient) return;

      const embed = new EmbedBuilder({
        title: "Couldn't delete flagged message",
        description: `A message sent in ${message.channel} was flagged but couldn't be deleted.`,
        fields: [
          { name: 'Sent by', value: `${message.author.tag}\n\`${message.author.id}\`` },
          { name: 'Flagged for', value: `${trueCategories.join(', ')}` },
          { name: 'Message', value: message.content },
          { name: 'Error', value: `${error}` },
        ],
      });

      await webhookClient.send({ embeds: [embed] });
      return;
    });

    const embed = new EmbedBuilder({
      title: 'Message Flagged',
      description:
        "This incident has been reported to the staff team. If you think this was an accident then you don't have to worry.",
      color: embedColor,
      fields: [
        {
          name: 'Sent by',
          value: `${message.author.tag}\n\`${message.author.id}\``,
        },
        {
          name: 'Flagged for',
          value: `${trueCategories.join(', ')}`,
        },
      ],
      timestamp: Date.now(),
    });

    await message.channel.send({
      content: `${message.author} your message was flagged as it was against OpenAI's moderation policy`,
      embeds: [embed],
    });

    // Log for staff/admins using webhook (if it exists)
    if (!webhookClient) return;

    embed.setDescription(`Message sent in ${message.channel} was flagged.`);
    embed.addFields({ name: 'Message', value: message.content });

    await webhookClient.send({ embeds: [embed] });
  } catch (error) {
    console.log(error);
  }
};
