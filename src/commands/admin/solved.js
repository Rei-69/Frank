const { Client, Interaction, PermissionFlagsBits, ChannelType } = require('discord.js');

const { solvedTagId, helperRole } = require('../../../config.json');
const { checkEmoji } = require('../../../emojis.json');

module.exports = {
  name: 'solved',
  description: 'Mark question as solved.',
  botPermissions: [PermissionFlagsBits.ManageChannels],

  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */

  callback: async (client, interaction) => {
    if (!(interaction.channel.type === ChannelType.PublicThread)) {
      interaction.reply({
        content: 'Channel type needs to be a public thread.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    let threadOwner;
    let starterMessage;

    try {
      starterMessage = await interaction.channel.fetchStarterMessage();
    } catch (error) {}

    if (starterMessage) {
      threadOwner = starterMessage.author;
    }

    if (
      interaction.member.permissions.has(PermissionFlagsBits.ManageChannels) ||
      interaction.member.id === threadOwner?.id ||
      interaction.member.roles.cache.some((role) => role.id === helperRole)
    ) {
      try {
        if (interaction.channel.appliedTags?.includes(solvedTagId)) {
          await interaction.editReply(
            'This thread has been archived again as it had previously been marked as solved.'
          );
          await interaction.channel.setArchived(true);
          return;
        }

        await interaction.channel.setAppliedTags([...interaction.channel.appliedTags, solvedTagId]);
        const messageAmount = interaction.channel.messageCount;

        await interaction.editReply(
          `${checkEmoji} ${
            threadOwner ? `${threadOwner}` : ''
          } Marked thread as solved after ${messageAmount} messages.`
        );
        await interaction.channel.setArchived(true);
      } catch (error) {
        console.log(`There was an error marking this thread as solved. ${error}`);
      }
    } else {
      interaction.editReply('Not enough permissions.');
    }
  },
};
