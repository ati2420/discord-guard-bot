const mongoose = require('mongoose');

const punishmentHistorySchema = new mongoose.Schema({
  guildId: String,
  userId: String,
  action: String, // 'warn', 'timeout', 'kick', 'ban', 'role_remove'
  reason: String,
  moderator: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PunishmentHistory', punishmentHistorySchema);
