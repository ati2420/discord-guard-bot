const { AuditLogEvent } = require('discord.js');
const { sendLog } = require('../utils/logger');
const { createErrorEmbed } = require('../utils/embeds');
const ServerSettings = require('../models/ServerSettings');
const config = require('../config.json');

module.exports = {
  name: 'roleDelete',
  async execute(role, client) {
    const guildId = role.guild.id;
    const settings = await ServerSettings.findOne({ guildId });

    if (!settings || !settings.protections.roleProtection) return;

    try {
      const auditLog = await role.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.RoleDelete });
      const logEntry = auditLog.entries.first();

      if (!logEntry) return;

      const executor = logEntry.executor;

      // Check if executor is trusted or owner
      if (settings.trustedUsers.includes(executor.id) || executor.id === process.env.OWNER_ID) return;

      const executorMember = await role.guild.members.fetch(executor.id).catch(() => null);
      if (!executorMember) return;

      // Remove all roles with dangerous permissions
      const rolesWithPermissions = executorMember.roles.cache.filter(r => {
        const perms = r.permissions;
        return config.dangerousPermissions.some(perm => perms.has(perm));
      });

      try {
        await executorMember.roles.remove(rolesWithPermissions);
      } catch (error) {
        console.error('Error removing roles:', error);
      }

      // Send log
      const embed = createErrorEmbed(
        '🛡️ Rol Koruması - Rol Silme',
        `**Kullanıcı:** <@${executor.id}>\n**Silinmiş Rol:** ${role.name}\n**İşlem:** Kullanıcının rolleri alındı`
      );

      await sendLog(client, guildId, 'rolLog', embed);
    } catch (error) {
      console.error('Role Delete Event Error:', error);
    }
  }
};