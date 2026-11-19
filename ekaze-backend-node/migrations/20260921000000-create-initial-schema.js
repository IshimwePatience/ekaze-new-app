'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Users Table
    await queryInterface.createTable('users', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      role: { 
        type: Sequelize.ENUM('admin', 'supervisor', 'company', 'employer', 'worker', 'police'),
        allowNull: false,
        defaultValue: 'worker'
      },
      name: { type: Sequelize.STRING(255), allowNull: false },
      email: { type: Sequelize.STRING(255), allowNull: true, unique: true },
      phone: { type: Sequelize.STRING(50), allowNull: true, unique: true },
      national_id: { type: Sequelize.STRING(50), allowNull: true, unique: true },
      gender: { type: Sequelize.ENUM('male', 'female', 'other'), allowNull: true },
      date_of_birth: { type: Sequelize.DATEONLY, allowNull: true },
      profile_photo: { type: Sequelize.STRING(500), allowNull: true },
      registration_document_type: { type: Sequelize.STRING(50), allowNull: true },
      passport_number: { type: Sequelize.STRING(100), allowNull: true },
      province: { type: Sequelize.STRING(100), allowNull: true },
      district: { type: Sequelize.STRING(100), allowNull: true },
      sector: { type: Sequelize.STRING(100), allowNull: true },
      cell: { type: Sequelize.STRING(100), allowNull: true },
      village: { type: Sequelize.STRING(100), allowNull: true },
      address: { type: Sequelize.TEXT, allowNull: true },
      status: { 
        type: Sequelize.ENUM('pending', 'active', 'suspended', 'inactive'),
        allowNull: false,
        defaultValue: 'pending'
      },
      is_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      verified_at: { type: Sequelize.DATE, allowNull: true },
      password: { type: Sequelize.STRING(255), allowNull: false },
      last_login_at: { type: Sequelize.DATE, allowNull: true },
      last_login_ip: { type: Sequelize.STRING(45), allowNull: true },
      otp_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      otp_resend_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      otp_blocked_until: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      deleted_at: { type: Sequelize.DATE, allowNull: true }
    });

    // 2. Sessions Table
    await queryInterface.createTable('sessions', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      token: { type: Sequelize.TEXT, allowNull: false },
      ip_address: { type: Sequelize.STRING(45), allowNull: true },
      user_agent: { type: Sequelize.STRING(500), allowNull: true },
      is_valid: { type: Sequelize.BOOLEAN, defaultValue: true },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // 3. Audit Logs Table
    await queryInterface.createTable('audit_logs', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.BIGINT, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      action: { type: Sequelize.STRING(255), allowNull: false },
      module: { type: Sequelize.STRING(100), allowNull: false },
      ip_address: { type: Sequelize.STRING(45), allowNull: true },
      user_agent: { type: Sequelize.STRING(500), allowNull: true },
      details: { type: Sequelize.JSONB, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // 4. Companies Table
    await queryInterface.createTable('companies', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.BIGINT, allowNull: false, unique: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      company_name: { type: Sequelize.STRING(255), allowNull: false },
      registration_number: { type: Sequelize.STRING(100), allowNull: true, unique: true },
      tin_number: { type: Sequelize.STRING(100), allowNull: true },
      contact_person: { type: Sequelize.STRING(255), allowNull: true },
      logo: { type: Sequelize.STRING(500), allowNull: true },
      document_path: { type: Sequelize.STRING(500), allowNull: true },
      verification_status: { type: Sequelize.ENUM('pending', 'approved', 'rejected', 'suspended'), defaultValue: 'pending' },
      approved_by: { type: Sequelize.BIGINT, allowNull: true },
      approved_at: { type: Sequelize.DATE, allowNull: true },
      wallet_balance: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0.00 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // 5. Workers Table
    await queryInterface.createTable('workers', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.BIGINT, allowNull: false, unique: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      company_id: { type: Sequelize.BIGINT, allowNull: true, references: { model: 'companies', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      skills: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      experience_years: { type: Sequelize.INTEGER, defaultValue: 0 },
      expected_salary: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      availability_status: { type: Sequelize.ENUM('available', 'hired', 'unavailable'), defaultValue: 'available' },
      qr_code_token: { type: Sequelize.STRING(255), allowNull: true, unique: true },
      business_card_path: { type: Sequelize.STRING(500), allowNull: true },
      card_paid: { type: Sequelize.BOOLEAN, defaultValue: false },
      card_paid_at: { type: Sequelize.DATE, allowNull: true },
      rating: { type: Sequelize.DECIMAL(3, 2), defaultValue: 5.00 },
      rating_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // 6. Employers Table
    await queryInterface.createTable('employers', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.BIGINT, allowNull: false, unique: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      employer_type: { type: Sequelize.ENUM('individual', 'corporate'), defaultValue: 'individual' },
      company_name: { type: Sequelize.STRING(255), allowNull: true },
      emergency_contact: { type: Sequelize.STRING(50), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // 7. Incidents Table
    await queryInterface.createTable('incidents', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      reporter_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      worker_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'workers', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      employer_id: { type: Sequelize.BIGINT, allowNull: true, references: { model: 'employers', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      company_id: { type: Sequelize.BIGINT, allowNull: true, references: { model: 'companies', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      assigned_officer_id: { type: Sequelize.BIGINT, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      incident_type: { type: Sequelize.ENUM('theft', 'misconduct', 'runaway', 'property_damage', 'fraud', 'other'), allowNull: false },
      status: { type: Sequelize.ENUM('reported', 'under_investigation', 'verified', 'resolved', 'dismissed'), defaultValue: 'reported' },
      province: { type: Sequelize.STRING(100), allowNull: true },
      district: { type: Sequelize.STRING(100), allowNull: true },
      sector: { type: Sequelize.STRING(100), allowNull: true },
      proof_files: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      police_notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // 8. Transactions Table
    await queryInterface.createTable('transactions', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      reference_id: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      user_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      type: { type: Sequelize.ENUM('card_payment', 'contact_unlock', 'hiring_fee', 'salary_payment', 'company_fee', 'withdrawal'), allowNull: false },
      amount: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      fee: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0.00 },
      payment_method: { type: Sequelize.STRING(50), defaultValue: 'mtn_momo' },
      phone_number: { type: Sequelize.STRING(50), allowNull: true },
      status: { type: Sequelize.ENUM('pending', 'successful', 'failed', 'under_review'), defaultValue: 'pending' },
      metadata: { type: Sequelize.JSONB, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // 9. Notifications Table
    await queryInterface.createTable('notifications', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      title: { type: Sequelize.STRING(255), allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: false },
      type: { type: Sequelize.STRING(50), defaultValue: 'info' },
      is_read: { type: Sequelize.BOOLEAN, defaultValue: false },
      read_at: { type: Sequelize.DATE, allowNull: true },
      data: { type: Sequelize.JSONB, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // 10. Hiring Requests Table
    await queryInterface.createTable('hiring_requests', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      employer_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'employers', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      worker_id: { type: Sequelize.BIGINT, allowNull: true, references: { model: 'workers', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      company_id: { type: Sequelize.BIGINT, allowNull: true, references: { model: 'companies', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      offered_salary: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      placement_fee: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0.00 },
      fee_paid: { type: Sequelize.BOOLEAN, defaultValue: false },
      status: { type: Sequelize.ENUM('pending', 'accepted', 'rejected', 'cancelled', 'completed'), defaultValue: 'pending' },
      start_date: { type: Sequelize.DATEONLY, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // 11. Employments Table
    await queryInterface.createTable('employments', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      employer_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'employers', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      worker_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'workers', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      company_id: { type: Sequelize.BIGINT, allowNull: true, references: { model: 'companies', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      monthly_salary: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY, allowNull: true },
      status: { type: Sequelize.ENUM('active', 'terminated', 'completed'), defaultValue: 'active' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('employments');
    await queryInterface.dropTable('hiring_requests');
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('transactions');
    await queryInterface.dropTable('incidents');
    await queryInterface.dropTable('employers');
    await queryInterface.dropTable('workers');
    await queryInterface.dropTable('companies');
    await queryInterface.dropTable('audit_logs');
    await queryInterface.dropTable('sessions');
    await queryInterface.dropTable('users');
  }
};
