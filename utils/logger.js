const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logTypes = {
  modLog: 'mod-log',
  jailLog: 'jail-log',
  mesajLog: 'mesaj-log',
  guardLog: 'guard-log',
  davetLog: 'davet-log',
  toLog: 'to-log',
  sesLog: 'ses-log',
  girisCikisLog: 'giriş-çıkış-log',
  banLog: 'ban-log',
  unbanLog: 'unban-log',
  rolLog: 'rol-log',
  kanalLog: 'kanal-log'
};

async function sendLog(client, guildId, logType, embed) {
  try {
    const ServerSettings = require('../models/ServerSettings');
    const settings = await ServerSettings.findOne({ guildId });

    if (!settings || !settings.logChannels[logType]) {
      console.log(`Log channel not set for ${logType} in guild ${guildId}`);
      return;
    }

    const channel = await client.channels.fetch(settings.logChannels[logType]);
    if (channel && channel.isTextBased()) {
      await channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error(`Error sending log: ${error}`);
  }
}

module.exports = {
  logTypes,
  sendLog
};