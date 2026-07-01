const { EmbedBuilder } = require('discord.js');

function createLogEmbed(title, description, color = 0x2F3136) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();
}

function createErrorEmbed(title, description) {
  return createLogEmbed(title, description, 0xFF0000);
}

function createSuccessEmbed(title, description) {
  return createLogEmbed(title, description, 0x00FF00);
}

function createWarningEmbed(title, description) {
  return createLogEmbed(title, description, 0xFFA500);
}

module.exports = {
  createLogEmbed,
  createErrorEmbed,
  createSuccessEmbed,
  createWarningEmbed
};