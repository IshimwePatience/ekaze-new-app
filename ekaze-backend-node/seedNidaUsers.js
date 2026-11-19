const { User, Admin, sequelize } = require('./models');
const { ensureUserRoleProfile } = require('./services/roleIsolationService');

const adminUser = {
  name: 'System Administrator',
  email: 'ishimwepatience87@gmail.com',
  phone: '0788000000',
  national_id: '1199000000000000',
  role: 'admin',
  gender: 'male',
  province: 'Kigali',
  district: 'Nyarugenge',
  sector: 'Nyarugenge',
  status: 'active',
  is_verified: true,
  verified_at: new Date(),
  password: 'Password123!'
};

async function seedAdminOnly() {
  try {
    await sequelize.authenticate();
    console.log('Connected to Database.');

    // Ensure database tables (admins, supervisors, police, etc.) exist
    await sequelize.sync({ alter: true });
    console.log('✓ Database schema synchronized.');

    // Update any existing admin or create/update for ishimwepatience87@gmail.com
    let admin = await User.findOne({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { email: 'ishimwepatience87@gmail.com' },
          { email: 'admin@ihirwe.rw' },
          { role: 'admin' }
        ]
      }
    });

    if (admin) {
      admin.email = 'ishimwepatience87@gmail.com';
      admin.role = 'admin';
      admin.password = 'Password123!';
      admin.status = 'active';
      admin.is_verified = true;
      await admin.save();
      console.log('✓ Admin user updated to ishimwepatience87@gmail.com.');
    } else {
      admin = await User.create(adminUser);
      console.log('✓ Admin user created with ishimwepatience87@gmail.com.');
    }

    // Ensure isolated Admin profile table record exists
    await ensureUserRoleProfile(admin);
    console.log('✓ Isolated Admin table profile verified.');

    console.log('\n=============================================');
    console.log('ADMIN CREDENTIALS:');
    console.log('Email / Login: ishimwepatience87@gmail.com');
    console.log('Phone: 0788000000');
    console.log('Password: Password123!');
    console.log('Role: admin');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdminOnly();
