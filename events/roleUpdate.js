const { AuditLogEvent } = require('discord.js');
const { sendLog } = require('../utils/logger');
const { createErrorEmbed, createWarningEmbed } = require('../utils/embeds');
const ServerSettings = require('../models/ServerSettings');
const config = require('../config.json');

module.exports = {
  name: 'roleUpdate',
  async execute(oldRole, newRole, client) {
    const guildId = newRole.guild.id;
    const settings = await ServerSettings.findOne({ guildId });

    if (!settings || !settings.protections.roleProtection) return;

    try {
      const auditLog = await newRole.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.RoleUpdate });
      const logEntry = auditLog.entries.first();

      if (!logEntry) return;

      const executor = logEntry.executor;
      const target = logEntry.target;

      // Check if executor is trusted or owner
      if (settings.trustedUsers.includes(executor.id) || executor.id === process.env.OWNER_ID) return;

      // Check what changed
      let changes = [];
      if (oldRole.name !== newRole.name) changes.push(`Adı değiştirildi: ${oldRole.name} → ${newRole.name}`);
      if (oldRole.color !== newRole.color) changes.push(`Rengi değiştirildi`);
      if (oldRole.permissions.bitfield !== oldRole.permissions.bitfield) changes.push(`İzinleri değiştirildi`);

      if (changes.length === 0) return;

      // Get all permissions executor has with the target role
      const executorMember = await newRole.guild.members.fetch(executor.id).catch(() => null);
      if (!executorMember) return;

      const rolesWithPermissions = executorMember.roles.cache.filter(role => {
        const perms = role.permissions;
        return config.dangerousPermissions.some(perm => perms.has(perm));
      });

      if (rolesWithPermissions.size === 0) return;

      // Remove all roles with dangerous permissions
      try {
        await executorMember.roles.remove(rolesWithPermissions);
      } catch (error) {
        console.error('Error removing roles:', error);
      }

      // Restore role to old state
      try {
        if (oldRole.name !== newRole.name) await newRole.setName(oldRole.name);
        if (oldRole.color !== newRole.color) await newRole.setColor(oldRole.color);
      } catch (error) {
        console.error('Error restoring role:', error);
      }

      // Send log
      const embed = createErrorEmbed(
        '🛡️ Rol Koruması',
        `**Kullanıcı:** <@${executor.id}>\n**Rol:** <@&${newRole.id}>\n**Değişiklikler:** ${changes.join(', ')}\n**İşlem:** Rolleri alındı ve rol geri yüklendi`
      );

      await sendLog(client, guildId, 'rolLog', embed);
    } catch (error) {
      console.error('Role Update Event Error:', error);
    }
  }
};