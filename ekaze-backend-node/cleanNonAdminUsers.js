const {
  User,
  Worker,
  Employer,
  Company,
  Supervisor,
  Police,
  Transaction,
  HiringRequest,
  Employment,
  Incident,
  Notification,
  AuditLog,
  HelpFeedback,
  ChatMessage,
  ChatConversation,
  Session,
  sequelize
} = require('./models');
const { Op } = require('sequelize');

async function cleanNonAdminUsers() {
  const t = await sequelize.transaction();

  try {
    console.log('🔍 Locating system administrators to preserve...');
    const adminUsers = await User.findAll({
      where: { role: 'admin' },
      transaction: t
    });

    const adminIds = adminUsers.map(u => u.id);
    console.log(`🛡️  Preserving ${adminIds.length} administrator account(s):`);
    adminUsers.forEach(a => console.log(`   - [ID ${a.id}] ${a.name} (${a.email || a.phone})`));

    const nonAdminUsers = await User.findAll({
      where: {
        id: { [Op.notIn]: adminIds.length ? adminIds : [-1] }
      },
      transaction: t
    });

    const nonAdminIds = nonAdminUsers.map(u => u.id);
    console.log(`\n🗑️  Found ${nonAdminIds.length} non-admin user(s) to remove.`);

    if (nonAdminIds.length === 0) {
      console.log('✅ No non-admin users found. Nothing to delete.');
      await t.commit();
      process.exit(0);
    }

    // Find associated workers, employers, companies
    const workers = await Worker.findAll({ where: { user_id: nonAdminIds }, transaction: t });
    const workerIds = workers.map(w => w.id);

    const employers = await Employer.findAll({ where: { user_id: nonAdminIds }, transaction: t });
    const employerIds = employers.map(e => e.id);

    const companies = await Company.findAll({ where: { user_id: nonAdminIds }, transaction: t });
    const companyIds = companies.map(c => c.id);

    console.log('🧹 Purging associated child records...');

    // 1. Chat & Messages
    if (ChatMessage) await ChatMessage.destroy({ where: { sender_id: nonAdminIds }, transaction: t }).catch(() => {});
    if (ChatConversation) {
      await ChatConversation.destroy({
        where: { [Op.or]: [{ participant_one_id: nonAdminIds }, { participant_two_id: nonAdminIds }] },
        transaction: t
      }).catch(() => {});
    }

    // 2. Notifications, Audit Logs, Sessions, Help Feedbacks
    if (Notification) await Notification.destroy({ where: { user_id: nonAdminIds }, transaction: t }).catch(() => {});
    if (AuditLog) await AuditLog.destroy({ where: { user_id: nonAdminIds }, transaction: t }).catch(() => {});
    if (Session) await Session.destroy({ where: { user_id: nonAdminIds }, transaction: t }).catch(() => {});
    if (HelpFeedback) await HelpFeedback.destroy({ where: { user_id: nonAdminIds }, transaction: t }).catch(() => {});

    // 3. Incidents
    if (Incident) {
      await Incident.destroy({
        where: {
          [Op.or]: [
            { reported_by_user_id: nonAdminIds },
            { reporter_id: nonAdminIds },
            workerIds.length ? { worker_id: workerIds } : null,
            companyIds.length ? { company_id: companyIds } : null
          ].filter(Boolean)
        },
        transaction: t
      }).catch(() => {});
    }

    // 4. Employments & Hiring Requests
    if (Employment) {
      await Employment.destroy({
        where: {
          [Op.or]: [
            workerIds.length ? { worker_id: workerIds } : null,
            employerIds.length ? { employer_id: employerIds } : null,
            companyIds.length ? { company_id: companyIds } : null
          ].filter(Boolean)
        },
        transaction: t
      }).catch(() => {});
    }

    if (HiringRequest) {
      await HiringRequest.destroy({
        where: {
          [Op.or]: [
            workerIds.length ? { worker_id: workerIds } : null,
            employerIds.length ? { employer_id: employerIds } : null,
            companyIds.length ? { company_id: companyIds } : null
          ].filter(Boolean)
        },
        transaction: t
      }).catch(() => {});
    }

    // 5. Transactions
    if (Transaction) {
      await Transaction.destroy({
        where: { user_id: nonAdminIds },
        transaction: t
      }).catch(() => {});
    }

    // 6. Role Profiles
    if (Worker && workerIds.length) await Worker.destroy({ where: { id: workerIds }, transaction: t });
    if (Employer && employerIds.length) await Employer.destroy({ where: { id: employerIds }, transaction: t });
    if (Company && companyIds.length) await Company.destroy({ where: { id: companyIds }, transaction: t });
    if (Supervisor) await Supervisor.destroy({ where: { user_id: nonAdminIds }, transaction: t }).catch(() => {});
    if (Police) await Police.destroy({ where: { user_id: nonAdminIds }, transaction: t }).catch(() => {});

    // 7. Users
    const deletedCount = await User.destroy({
      where: { id: nonAdminIds },
      transaction: t
    });

    await t.commit();
    console.log(`\n🎉 SUCCESS: Deleted ${deletedCount} non-admin user(s) and all linked data.`);
    console.log('🛡️  Admin account(s) remain untouched and active.');
    process.exit(0);
  } catch (error) {
    await t.rollback();
    console.error('❌ Error cleaning users:', error);
    process.exit(1);
  }
}

cleanNonAdminUsers();
