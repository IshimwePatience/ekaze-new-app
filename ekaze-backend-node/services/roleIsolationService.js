const { User, Worker, Employer, Company, Admin, Supervisor, Police } = require('../models');

/**
 * Ensures a User has a corresponding record in their isolated role-specific table.
 * If the record doesn't exist, it creates a default entry in the target role table.
 *
 * @param {Object} user - The User instance or payload
 * @returns {Promise<Object>} The updated user with isolated role profile included
 */
async function ensureUserRoleProfile(user) {
  if (!user || !user.id || !user.role) return user;

  try {
    switch (user.role) {
      case 'admin':
        await Admin.findOrCreate({
          where: { user_id: user.id },
          defaults: { user_id: user.id, admin_level: 'super_admin', department: 'System Administration' }
        });
        break;

      case 'supervisor':
        await Supervisor.findOrCreate({
          where: { user_id: user.id },
          defaults: { user_id: user.id, department: 'Inspection' }
        });
        break;

      case 'police':
        await Police.findOrCreate({
          where: { user_id: user.id },
          defaults: { user_id: user.id, rank: 'Officer' }
        });
        break;

      case 'worker':
        await Worker.findOrCreate({
          where: { user_id: user.id },
          defaults: { user_id: user.id, availability_status: 'available' }
        });
        break;

      case 'employer':
        await Employer.findOrCreate({
          where: { user_id: user.id },
          defaults: { user_id: user.id, employer_type: 'individual' }
        });
        break;

      case 'company':
        await Company.findOrCreate({
          where: { user_id: user.id },
          defaults: { user_id: user.id, company_name: user.name || 'Company Account' }
        });
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(`Error ensuring role profile for user ${user.id} (${user.role}):`, error);
  }

  // Refetch full user with all isolated role models included
  return await User.findByPk(user.id, {
    include: [
      { model: Company, as: 'company' },
      { model: Worker, as: 'worker', include: [{ model: Company, as: 'company' }] },
      { model: Employer, as: 'employer' },
      { model: Admin, as: 'adminProfile' },
      { model: Supervisor, as: 'supervisorProfile' },
      { model: Police, as: 'policeProfile' }
    ]
  });
}

module.exports = {
  ensureUserRoleProfile
};
