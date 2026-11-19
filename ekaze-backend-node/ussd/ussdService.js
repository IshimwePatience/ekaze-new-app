const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Worker, Employer, Employment, Transaction, Company } = require('../models');
const locales = require('./locales');

// Memory cache fallback for session variables if Redis is offline
const sessionMemoryCache = new Map();

/**
 * Normalizes Rwandan phone numbers to match across formats (+25078..., 078..., 25078..., 78...)
 */
const getPhoneVariants = (rawPhone) => {
  if (!rawPhone) return [];
  const cleaned = String(rawPhone).replace(/[^0-9]/g, '');
  const variants = new Set();

  variants.add(rawPhone);
  variants.add(cleaned);

  if (cleaned.startsWith('250') && cleaned.length === 12) {
    const local = '0' + cleaned.substring(3);
    variants.add('+' + cleaned);
    variants.add(cleaned);
    variants.add(local);
  } else if (cleaned.startsWith('0') && cleaned.length === 10) {
    const intl = '250' + cleaned.substring(1);
    variants.add(cleaned);
    variants.add(intl);
    variants.add('+' + intl);
  } else if (cleaned.length === 9) {
    // e.g. 788000004
    variants.add('0' + cleaned);
    variants.add('250' + cleaned);
    variants.add('+250' + cleaned);
  }

  return Array.from(variants);
};

/**
 * Main USSD Engine Process
 */
const handleUssdSession = async ({ sessionId, serviceCode, phoneNumber, text }) => {
  try {
    const phoneVariants = getPhoneVariants(phoneNumber);

    // 1. Find User by phone variants
    const user = await User.findOne({
      where: {
        phone: { [Op.in]: phoneVariants }
      },
      include: [
        { model: Worker, as: 'worker' },
        { model: Employer, as: 'employer' },
        { model: Company, as: 'company' }
      ]
    });

    // Handle Unregistered Phone
    if (!user) {
      return `END Murakaza neza kuri Ekaze.\nNimero yawe (${phoneNumber}) ntabwo yanditse mu rusobe rwacu.\nSura ekaze.rw wiyandikishe.`;
    }

    // Input sequence array from telecom aggregator (e.g. "1*2*5000")
    const inputs = text ? text.split('*').map(s => s.trim()).filter(Boolean) : [];

    // ==========================================
    // 2. LANGUAGE SELECTION (First Time Check)
    // ==========================================
    if (!user.preferred_language) {
      if (inputs.length === 0) {
        return `CON ${locales.kin.select_language}`;
      }

      const langChoice = inputs[0];
      let chosenLang = 'kin';
      if (langChoice === '2') {
        chosenLang = 'en';
      }

      // Persist chosen language to user record
      user.preferred_language = chosenLang;
      await user.save().catch(() => {});

      const t = locales[chosenLang];
      const role = (user.role || 'worker').toLowerCase();
      const menu = role === 'employer' ? t.employer_menu : t.worker_menu;
      return `CON ${t.welcome(user.name)}\n\n${menu}`;
    }

    // User already has a persisted language
    let lang = user.preferred_language || 'kin';
    const t = locales[lang];

    // Check if user requested changing language (menu option 9)
    if (inputs[0] === '9') {
      if (inputs.length === 1) {
        return `CON ${t.select_language}`;
      }
      const newLangChoice = inputs[1];
      const updatedLang = newLangChoice === '2' ? 'en' : 'kin';
      user.preferred_language = updatedLang;
      await user.save().catch(() => {});
      const newT = locales[updatedLang];
      return `END ${newT.language_changed}\nOngera uhamagare *789# ukoreshe ururimi rushya.`;
    }

    // ==========================================
    // 3. PIN SETUP (If User Has No USSD PIN Set)
    // ==========================================
    if (!user.ussd_pin) {
      if (inputs.length === 0) {
        return `CON ${t.welcome(user.name)}\n${t.setup_pin_prompt}`;
      }
      if (inputs.length === 1) {
        const pin = inputs[0];
        if (!/^\d{4}$/.test(pin)) {
          return `CON PIN igomba kuba imibare 4 gusa.\n${t.setup_pin_prompt}`;
        }
        return `CON ${t.confirm_pin_prompt}`;
      }
      if (inputs.length === 2) {
        const pin1 = inputs[0];
        const pin2 = inputs[1];
        if (pin1 !== pin2) {
          return `END ${t.pin_mismatch}`;
        }

        // Hash and store 4-digit PIN
        const salt = await bcrypt.genSalt(10);
        user.ussd_pin = await bcrypt.hash(pin1, salt);
        await user.save();
        return `END ${t.pin_setup_success}`;
      }
    }

    // ==========================================
    // 4. MAIN MENU ROUTING BY USER ROLE
    // ==========================================
    const role = (user.role || 'worker').toLowerCase();

    // ──────────────── WORKER FLOW ─────────────
    if (role === 'worker') {
      const worker = user.worker;
      const workerId = worker ? worker.id : 0;

      // Top level worker menu
      if (inputs.length === 0) {
        return `CON ${t.welcome(user.name)}\n\n${t.worker_menu}`;
      }

      const mainOption = inputs[0];

      // Option 0: Exit
      if (mainOption === '0') {
        return `END ${t.exit_msg}`;
      }

      // Option 1: Check Wallet Balance
      if (mainOption === '1') {
        if (inputs.length === 1) {
          return `CON ${t.enter_pin}`;
        }
        const enteredPin = inputs[1];
        const isPinValid = await bcrypt.compare(enteredPin, user.ussd_pin);
        if (!isPinValid) {
          return `END ${t.invalid_pin}`;
        }

        // Fetch balances
        const availableBalance = Number(worker?.wallet_balance || 0);
        // Find active employment for pending wages
        const activeEmployment = await Employment.findOne({
          where: { worker_id: workerId, status: 'active' }
        });
        const pendingSalary = activeEmployment ? Number(activeEmployment.monthly_salary || 100000) : 0;

        return `CON ${t.balance_display(availableBalance, pendingSalary)}`;
      }

      // Option 2: Check Savings Vault
      if (mainOption === '2') {
        if (inputs.length === 1) {
          return `CON ${t.enter_pin}`;
        }
        const enteredPin = inputs[1];
        const isPinValid = await bcrypt.compare(enteredPin, user.ussd_pin);
        if (!isPinValid) {
          return `END ${t.invalid_pin}`;
        }

        const totalSavings = Number(worker?.savings_balance || worker?.extended_profile?.savings_config?.total_accumulated || 0);
        const monthlyTarget = Number(worker?.extended_profile?.savings_config?.monthly_deduction || 10000);

        return `CON ${t.savings_display(totalSavings, monthlyTarget)}`;
      }

      // Option 3: Withdraw to MoMo / Airtel Money
      if (mainOption === '3') {
        const availableBalance = Number(worker?.wallet_balance || 0);

        if (inputs.length === 1) {
          return `CON ${t.withdraw_amount_prompt(availableBalance)}`;
        }

        const withdrawAmount = Number(inputs[1]);
        if (isNaN(withdrawAmount) || withdrawAmount < 500) {
          return `END ${t.withdraw_min_error}`;
        }

        if (withdrawAmount > availableBalance) {
          return `END ${t.withdraw_insufficient(availableBalance)}`;
        }

        if (inputs.length === 2) {
          return `CON ${t.withdraw_pin_prompt(withdrawAmount, user.phone)}`;
        }

        const enteredPin = inputs[2];
        const isPinValid = await bcrypt.compare(enteredPin, user.ussd_pin);
        if (!isPinValid) {
          return `END ${t.invalid_pin}`;
        }

        // Perform balance deduction
        worker.wallet_balance = Math.max(0, availableBalance - withdrawAmount);
        await worker.save();

        // Record transaction
        const txRef = 'WD-' + Date.now().toString().slice(-6);
        await Transaction.create({
          user_id: user.id,
          reference: txRef,
          type: 'withdrawal',
          amount: withdrawAmount,
          currency: 'RWF',
          status: 'completed',
          payment_method: 'momo_ussd',
          phone_number: user.phone,
          description: `USSD MoMo Withdrawal of ${withdrawAmount} RWF to ${user.phone}`
        }).catch(() => {});

        return `END ${t.withdraw_success(withdrawAmount, user.phone, txRef)}`;
      }

      // Option 4: Save from Balance to Savings Vault
      if (mainOption === '4') {
        const availableBalance = Number(worker?.wallet_balance || 0);

        if (inputs.length === 1) {
          return `CON ${t.save_amount_prompt(availableBalance)}`;
        }

        const saveAmount = Number(inputs[1]);
        if (isNaN(saveAmount) || saveAmount < 100) {
          return `END Ntushobora kwizigama munsi ya 100 RWF.`;
        }

        if (saveAmount > availableBalance) {
          return `END ${t.withdraw_insufficient(availableBalance)}`;
        }

        if (inputs.length === 2) {
          return `CON ${t.save_pin_prompt(saveAmount)}`;
        }

        const enteredPin = inputs[2];
        const isPinValid = await bcrypt.compare(enteredPin, user.ussd_pin);
        if (!isPinValid) {
          return `END ${t.invalid_pin}`;
        }

        // Perform fund transfer between wallet and savings
        worker.wallet_balance = Math.max(0, availableBalance - saveAmount);
        const currentSavings = Number(worker.savings_balance || 0);
        worker.savings_balance = currentSavings + saveAmount;
        await worker.save();

        // Record savings transaction
        const txRef = 'SV-' + Date.now().toString().slice(-6);
        await Transaction.create({
          user_id: user.id,
          reference: txRef,
          type: 'saving',
          amount: saveAmount,
          currency: 'RWF',
          status: 'completed',
          payment_method: 'wallet_to_vault',
          phone_number: user.phone,
          description: `USSD Manual Savings Vault Deposit of ${saveAmount} RWF`
        }).catch(() => {});

        return `END ${t.save_success(saveAmount, worker.savings_balance)}`;
      }

      // Option 5: View Active Employment
      if (mainOption === '5') {
        const activeEmployment = await Employment.findOne({
          where: { worker_id: workerId, status: 'active' },
          include: [{ model: Employer, as: 'employer', include: [{ model: User, as: 'user' }] }]
        });

        if (!activeEmployment) {
          return `CON ${t.no_active_employment}`;
        }

        const employerName = activeEmployment.employer?.user?.name || activeEmployment.employer?.company_name || 'Employer';
        const salary = activeEmployment.monthly_salary || 100000;
        const startDate = activeEmployment.start_date ? String(activeEmployment.start_date).split('T')[0] : 'Ubu';

        return `CON ${t.active_employment(employerName, salary, startDate)}`;
      }

      return `CON ${t.worker_menu}`;
    }

    // ──────────────── EMPLOYER FLOW ─────────────
    if (role === 'employer' || role === 'company') {
      const employer = user.employer;
      const employerId = employer ? employer.id : 0;

      if (inputs.length === 0) {
        return `CON ${t.welcome(user.name)}\n\n${t.employer_menu}`;
      }

      const mainOption = inputs[0];

      if (mainOption === '0') {
        return `END ${t.exit_msg}`;
      }

      // Option 1: Check Worker Savings on behalf of worker
      if (mainOption === '1') {
        // Fetch active employments linked to this employer
        const employments = await Employment.findAll({
          where: { employer_id: employerId, status: 'active' },
          include: [{ model: Worker, as: 'worker', include: [{ model: User, as: 'user' }] }]
        });

        if (!employments || employments.length === 0) {
          return `CON ${t.no_workers_found}`;
        }

        if (inputs.length === 1) {
          let workerListMenu = t.employer_select_worker;
          employments.forEach((emp, idx) => {
            const wName = emp.worker?.user?.name || `Worker #${emp.worker_id}`;
            workerListMenu += `${idx + 1}. ${wName}\n`;
          });
          workerListMenu += `0. Subira inyuma`;
          return `CON ${workerListMenu}`;
        }

        const chosenIndex = Number(inputs[1]) - 1;
        if (inputs[1] === '0' || isNaN(chosenIndex) || !employments[chosenIndex]) {
          return `CON ${t.employer_menu}`;
        }

        const selectedEmployment = employments[chosenIndex];
        const targetWorker = selectedEmployment.worker;
        const targetUser = targetWorker?.user;
        const workerSavings = Number(targetWorker?.savings_balance || targetWorker?.extended_profile?.savings_config?.total_accumulated || 0);
        const monthlyRemittance = Number(targetWorker?.extended_profile?.savings_config?.monthly_deduction || 10000);

        return `CON ${t.employer_worker_savings(targetUser?.name || 'Worker', workerSavings, monthlyRemittance)}`;
      }

      // Option 2: Approve Worker Salary
      if (mainOption === '2') {
        return `CON EKAZEOUT APPROVAL:\nIhemba ry'ukwezi rijyanye na MoMo approval.\nKoresha *182# kwemeza cyangwa kanda 0 usubire inyuma.\n\n0. Subira inyuma`;
      }

      // Option 3: View Escrow Balance
      if (mainOption === '3') {
        const escrowBalance = Number(user.company?.wallet_balance || 250000);
        return `CON ${t.employer_escrow_display(escrowBalance)}`;
      }

      return `CON ${t.employer_menu}`;
    }

    return `END Murakaza neza kuri Ekaze. Sura ekaze.rw kuri internet.`;

  } catch (error) {
    console.error('USSD processing error:', error);
    return `END Habaye ikibazo mu rusobe. Ongera ugerageze mukanya.`;
  }
};

module.exports = {
  handleUssdSession,
  getPhoneVariants
};
