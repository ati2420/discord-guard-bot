const mongoose = require('mongoose');

const serverSettingsSchema = new mongoose.Schema({
  guildId: String,
  trustedUsers: [String],
  logChannels: {
    modLog: String,
    jailLog: String,
    mesajLog: String,
    guardLog: String,
    davetLog: String,
    toLog: String,
    sesLog: String,
    girisCikisLog: String,
    banLog: String,
    unbanLog: String,
    rolLog: String,
    kanalLog: String
  },
  protections: {
    roleProtection: { type: Boolean, default: true },
    channelProtection: { type: Boolean, default: true },
    botProtection: { type: Boolean, default: true },
    webhookProtection: { type: Boolean, default: true },
    banProtection: { type: Boolean, default: true },
    kickProtection: { type: Boolean, default: true },
    timeoutProtection: { type: Boolean, default: true },
    lockedChannelProtection: { type: Boolean, default: true },
    mentionProtection: { type: Boolean, default: true },
    serverProtection: { type: Boolean, default: true },
    emojiProtection: { type: Boolean, default: true },
    inviteProtection: { type: Boolean, default: true }
  },
  lockedChannels: [String],
  authorizedRoles: [String],
  bannedWords: [String],
  warnings: {
    type: Map,
    of: Number,
    default: new Map()
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ServerSettings', serverSettingsSchema);