const { User, sequelize } = require('./models');
const { ensureUserRoleProfile } = require('./services/roleIsolationService');

const demoUsers = [
  {
    name: 'District Supervisor',
    email: 'supervisor@ekazepay.rw',
    phone: '250788000001',
    national_id: '1199000000000001',
    role: 'supervisor',
    gender: 'male',
    province: 'Kigali',
    district: 'Gasabo',
    sector: 'Gasabo',
    status: 'active',
    is_verified: true,
    verified_at: new Date(),
    password: 'password'
  },
  {
    name: 'System Admin',
    email: 'admin@ekazepay.rw',
    phone: '250788000002',
    national_id: '1199000000000002',
    role: 'admin',
    gender: 'male',
    province: 'Kigali',
    district: 'Gasabo',
    sector: 'Gasabo',
    status: 'active',
    is_verified: true,
    verified_at: new Date(),
    password: 'password'
  },
  {
    name: 'Test Police Officer',
    email: 'police@ekazepay.rw',
    phone: '250788000006',
    national_id: '1199000000000006',
    role: 'police',
    gender: 'male',
    province: 'Kigali',
    district: 'Remera',
    sector: 'Remera',
    status: 'active',
    is_verified: true,
    verified_at: new Date(),
    password: 'password'
  },
  {
    name: 'Test Company',
    email: 'company@test.rw',
    phone: '250788000003',
    national_id: '1199000000000003',
    role: 'company',
    gender: 'male',
    province: 'Kigali',
    district: 'Kicukiro',
    sector: 'Kicukiro',
    status: 'active',
    is_verified: true,
    verified_at: new Date(),
    password: 'password'
  },
  {
    name: 'Test Employer',
    email: 'employer@test.rw',
    phone: '250788000004',
    national_id: '1199000000000004',
    role: 'employer',
    gender: 'male',
    province: 'Kigali',
    district: 'Kicukiro',
    sector: 'Kicukiro',
    status: 'active',
    is_verified: true,
    verified_at: new Date(),
    password: 'password'
  },
  {
    name: 'Test Worker',
    email: 'worker@test.rw',
    phone: '250788000005',
    national_id: '1199000000000005',
    role: 'worker',
    gender: 'female',
    province: 'Kigali',
    district: 'Nyarugenge',
    sector: 'Nyarugenge',
    status: 'active',
    is_verified: true,
    verified_at: new Date(),
    password: 'password'
  }
];

async function seedAllUsers() {
  try {
    await sequelize.authenticate();
    console.log('Connected to Database.');
    await sequelize.sync({ alter: true });
    console.log('✓ Database schema synchronized.');

    for (const userData of demoUsers) {
      let user = await User.findOne({
        where: {
          [sequelize.Sequelize.Op.or]: [
            { email: userData.email },
            { phone: userData.phone },
            { national_id: userData.national_id }
          ]
        }
      });

      if (user) {
        user.name = userData.name;
        user.email = userData.email;
        user.phone = userData.phone;
        user.national_id = userData.national_id;
        user.role = userData.role;
        user.password = userData.password;
        user.status = 'active';
        user.is_verified = true;
        await user.save();
        console.log(`✓ Updated user: ${userData.email} (${userData.role})`);
      } else {
        user = await User.create(userData);
        console.log(`✓ Created user: ${userData.email} (${userData.role})`);
      }

      await ensureUserRoleProfile(user);
    }

    console.log('\n=============================================');
    console.log('ALL DEMO USERS SEEDED SUCCESSFULLY:');
    demoUsers.forEach(u => {
      console.log(`- ${u.role.toUpperCase()}: ${u.email} / password`);
    });
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo users:', error);
    process.exit(1);
  }
}

seedAllUsers();
