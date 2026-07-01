const { AuditLogEvent } = require('discord.js');
const { sendLog } = require('../utils/logger');
const { createErrorEmbed } = require('../utils/embeds');
const ServerSettings = require('../models/ServerSettings');
const config = require('../config.json');

module.exports = {
  name: 'roleCreate',
  async execute(role, client) {
    const guildId = role.guild.id;
    const settings = await ServerSettings.findOne({ guildId });

    if (!settings || !settings.protections.roleProtection) return;

    try {
      const auditLog = await role.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.RoleCreate });
      const logEntry = auditLog.entries.first();

      if (!logEntry) return;

      const executor = logEntry.executor;

      // Check if executor is trusted or owner
      if (settings.trustedUsers.includes(executor.id) || executor.id === process.env.OWNER_ID) return;

      // Check if role has dangerous permissions
      const hasDangerousPerms = config.dangerousPermissions.some(perm => role.permissions.has(perm));

      if (!hasDangerousPerms) return;

      const executorMember = await role.guild.members.fetch(executor.id).catch(() => null);
      if (!executorMember) return;

      // Remove all roles with dangerous permissions from executor
      const rolesWithPermissions = executorMember.roles.cache.filter(r => {
        const perms = r.permissions;
        return config.dangerousPermissions.some(perm => perms.has(perm));
      });

      try {
        await executorMember.roles.remove(rolesWithPermissions);
      } catch (error) {
        console.error('Error removing roles:', error);
      }

      // Delete the dangerous role
      try {
        await role.delete('Guard Protection: Dangerous role created');
      } catch (error) {
        console.error('Error deleting role:', error);
      }

      // Send log
      const embed = createErrorEmbed(
        '🛡️ Rol Koruması - Tehlikeli Rol',
        `**Kullanıcı:** <@${executor.id}>\n**Rol:** ${role.name}\n**İzinler:** Yönetici izinleri içeriyor\n**İşlem:** Rol silindi ve kullanıcının rolleri alındı`
      );

      await sendLog(client, guildId, 'rolLog', embed);
    } catch (error) {
      console.error('Role Create Event Error:', error);
    }
  }
};