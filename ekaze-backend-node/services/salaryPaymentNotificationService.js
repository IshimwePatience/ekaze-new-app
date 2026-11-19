const { Op } = require('sequelize');
const { Notification, User, Employer, Worker, Employment, Company, Transaction, Setting } = require('../models');
const { sendNotification } = require('./socketService');
const { sendSMS, resolveUserLanguage } = require('./smsService');

/**
 * Calculates payment status and due dates for an active employment
 */
const getEmploymentPaymentContext = async (employment, referenceDate = new Date()) => {
  const salary = parseFloat(employment.monthly_salary || 0);
  const now = referenceDate;
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Derive payment day strictly from saved contract schedule first, then fallback to start date.
  // Parse YYYY-MM-DD DATEONLY strings in local time to avoid UTC day-shift.
  const parseContractStartDate = (rawDate, fallback) => {
    if (!rawDate) return new Date(fallback || Date.now());
    if (typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDate.trim())) {
      const [y, m, d] = rawDate.trim().split('-').map(Number);
      return new Date(y, m - 1, d, 0, 0, 0);
    }
    return new Date(rawDate);
  };

  const contractStart = parseContractStartDate(employment.start_date, employment.created_at);
  const contractCreatedAt = new Date(employment.created_at || contractStart);
  const ext = employment.worker?.extended_profile || {};
  const savedPayDay =
    employment.payment_day ||
    ext.contract_terms?.[employment.id]?.payment_day ||
    ext.latest_payment_day ||
    ext.payment_day;
  const rawPayDay = parseInt(savedPayDay || contractStart.getDate(), 10);
  const payDay = Math.min(31, Math.max(1, isNaN(rawPayDay) ? contractStart.getDate() : rawPayDay));

  const contractTimeFormatted = contractCreatedAt.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  const contractStartDateFormatted = contractStart.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const buildMonthDueDate = (year, month) => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(payDay, lastDay), 23, 59, 59);
  };

  let currentMonthDueDate = buildMonthDueDate(currentYear, currentMonth);

  // If the configured payday in the signing month falls on or before the contract start day,
  // the first scheduled salary cycle starts next month (never overdue on the day the contract is signed).
  const isSigningMonth =
    currentYear === contractStart.getFullYear() && currentMonth === contractStart.getMonth();
  const targetDayThisMonth = Math.min(payDay, new Date(currentYear, currentMonth + 1, 0).getDate());
  if (isSigningMonth && targetDayThisMonth <= contractStart.getDate()) {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    currentMonthDueDate = buildMonthDueDate(nextYear, nextMonth);
  }

  // Determine whether this month's or previous month's salary was paid
  // Check payments made in the last 35 days
  const thirtyFiveDaysAgo = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000);
  const workerUserId = employment.worker?.user_id || employment.worker_id;

  const successfulTx = await Transaction.findAll({
    where: {
      type: 'salary_payment',
      status: 'successful',
      created_at: { [Op.gte]: thirtyFiveDaysAgo }
    }
  }).catch(() => []);

  const hasRecentPaid = successfulTx.some(tx => {
    const meta = tx.metadata || {};
    const empUserId = employment.employer?.user_id;
    const matchesEmployer = !empUserId || tx.user_id == empUserId;
    if (!matchesEmployer) return false;

    const matchesBatch =
      meta.is_batch &&
      Array.isArray(meta.workers) &&
      meta.workers.some(
        w => w.worker_id == employment.worker_id || w.employment_id == employment.id
      );

    return (
      matchesBatch ||
      tx.user_id == workerUserId ||
      meta.worker_id == employment.worker_id ||
      meta.worker_id == workerUserId ||
      meta.employment_id == employment.id
    );
  });

  let dueDate = currentMonthDueDate;
  let isOverdue = false;
  let isUpcoming = false;
  let daysDifference = 0;

  if (dueDate > now) {
    // Next due date is still in the future (including signing-month rollover to next month)
    isOverdue = false;
    const msUpcoming = dueDate.getTime() - now.getTime();
    daysDifference = Math.ceil(msUpcoming / (1000 * 60 * 60 * 24));
    if (!hasRecentPaid && daysDifference >= 0 && daysDifference <= 5) {
      isUpcoming = true;
    }
  } else {
    // Scheduled payday has passed
    if (!hasRecentPaid) {
      isOverdue = true;
      const msOver = now.getTime() - currentMonthDueDate.getTime();
      daysDifference = Math.max(1, Math.floor(msOver / (1000 * 60 * 60 * 24)));
    } else {
      // Already paid for this month, calculate next month's due date
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      dueDate = buildMonthDueDate(nextYear, nextMonth);
      const msUpcoming = dueDate.getTime() - now.getTime();
      daysDifference = Math.ceil(msUpcoming / (1000 * 60 * 60 * 24));
      if (daysDifference >= 1 && daysDifference <= 5) {
        isUpcoming = true;
      }
    }
  }

  return {
    salary,
    payDay,
    paymentTime: contractTimeFormatted,
    contractStartDate: contractStartDateFormatted,
    dueDate,
    dueDateFormatted: dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    isOverdue,
    isUpcoming,
    daysDifference, // if overdue, how many days past; if upcoming, how many days remaining
    hasRecentPaid
  };
};

/**
 * Fetch configured payment source details for employer
 */
const getEmployerPaymentSource = async (employerUserId) => {
  let paymentMethod = 'mtn_momo';
  let accountIdentifier = '';
  let isCard = false;
  let enabled = true;
  let isConfigured = false;
  let payoutMode = 'auto_all';

  try {
    const settingKey = `employer_auto_payment_${employerUserId}`;
    const dbRow = await Setting.findOne({ where: { key: settingKey } });
    if (dbRow && dbRow.value) {
      const config = JSON.parse(dbRow.value);
      paymentMethod = config.payment_method || 'mtn_momo';
      enabled = config.enabled !== undefined ? Boolean(config.enabled) : true;
      isConfigured = Boolean(config.is_configured);
      payoutMode = config.payout_mode || 'auto_all';
      accountIdentifier = config.phone_number || '';
      isCard = false;
    }
  } catch (err) {
    // ignore
  }

  return { paymentMethod, accountIdentifier, isCard, enabled, isConfigured, payoutMode };
};

const activeAutoPollRefs = new Set();

/**
 * Shared helper: Disburses MTN MoMo transfer to a single worker, updates wallet & savings balances,
 * records salary_received transaction, and sends language-aware SMS + In-App notification to worker.
 */
const settleSingleWorkerSalary = async ({
  workerId,
  employmentId,
  payAmount,
  employerName,
  refId,
  payoutType = 'manual_one_by_one',
  isAutomatic = false
}) => {
  const mtnMomoService = require('./mtnMomoService');
  const { v4: uuidv4 } = require('uuid');

  const worker = await Worker.findByPk(workerId, {
    include: [{ model: User, as: 'user' }]
  }).catch(() => null);
  if (!worker) return null;

  const workerPhone = worker.user?.phone || worker.phone || '';
  const workerName = worker.user?.name || worker.full_name || 'Worker';
  const numAmount = Number(payAmount || 0);

  let transferRef = null;
  if (workerPhone && mtnMomoService.normalizeMtnPhone(workerPhone)) {
    transferRef = uuidv4();
    await mtnMomoService.transfer({
      phone: workerPhone,
      amount: numAmount,
      referenceId: transferRef,
      externalId: `${refId}-W${worker.id}`,
      note: `EKAZE Salary from ${employerName}`
    }).catch(err => console.warn('Worker MTN MoMo transfer notice:', err.message));
  }

  const ext = worker.extended_profile || {};
  const savCfg = ext.savings_config || {};
  const isSavingsActive = savCfg.enabled === true || savCfg.status === 'active';
  const configuredFixed = Number(savCfg.amount || savCfg.monthly_amount || 0);
  let savingsPortion = 0;
  if (isSavingsActive) {
    if (savCfg.type === 'fixed' || configuredFixed > 0) {
      savingsPortion = Math.min(numAmount, Math.max(0, Math.round(configuredFixed)));
    } else {
      const pct = parseFloat(savCfg.percentage || savCfg.target_percentage || 10);
      savingsPortion = pct > 0 ? Math.min(numAmount, Math.round((numAmount * pct) / 100)) : 0;
    }
  }
  const walletPortion = Math.max(0, numAmount - savingsPortion);

  const curWallet = parseFloat(worker.wallet_balance || 0);
  const newWalletBalance = curWallet + walletPortion;
  const curSavings = parseFloat(savCfg.total_accumulated || worker.savings_balance || ext.savings_balance || 0);
  const newSavings = savingsPortion > 0 ? (curSavings + savingsPortion) : curSavings;

  worker.wallet_balance = newWalletBalance;
  if (savingsPortion > 0) {
    savCfg.total_accumulated = newSavings;
    ext.savings_config = savCfg;
    ext.savings_balance = newSavings;
    worker.savings_balance = newSavings;
    worker.extended_profile = ext;
    worker.changed('extended_profile', true);
  }
  await worker.save().catch(err => console.error('Failed to update worker wallet/savings:', err));

  if (worker.user_id) {
    await Transaction.create({
      reference_id: `SAL-${refId}-${worker.id}`,
      user_id: worker.user_id,
      type: 'salary_received',
      amount: numAmount,
      fee: 0,
      payment_method: 'mtn_momo',
      phone_number: workerPhone,
      status: 'successful',
      metadata: {
        wallet_credited: walletPortion,
        savings_credited: savingsPortion,
        wallet_balance_after: newWalletBalance,
        savings_balance_after: newSavings,
        employer_name: employerName,
        employment_id: employmentId || null,
        salary_ref: refId,
        transfer_ref: transferRef,
        payout_type: payoutType || 'manual_one_by_one'
      }
    }).catch(() => {});

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const workerLang = resolveUserLanguage(null, worker.user);
    const hasSavingsInfo = isSavingsActive || savingsPortion > 0;

    let title;
    let message;
    if (workerLang === 'rw') {
      title = isAutomatic ? 'Umushahara Wishyuwe Bwikora kuri MTN MoMo' : 'Umushahara Wakiriwe kuri MTN MoMo';
      message = hasSavingsInfo
        ? `Ekaze: Wakiriye umushahara wa ${numAmount.toLocaleString()} RWF uturutse kuri ${employerName} kuwa ${dateStr} saa ${timeStr}. Ayashyizwe kuri konti: ${walletPortion.toLocaleString()} RWF (Asigaye kuri konti: ${newWalletBalance.toLocaleString()} RWF). Ayazigamwe: ${savingsPortion.toLocaleString()} RWF (Ubwizigame bwose: ${newSavings.toLocaleString()} RWF).`
        : `Ekaze: Wakiriye umushahara wa ${numAmount.toLocaleString()} RWF uturutse kuri ${employerName} kuwa ${dateStr} saa ${timeStr}. Asigaye kuri konti yawe ni ${newWalletBalance.toLocaleString()} RWF.`;
    } else {
      title = isAutomatic ? 'Salary Paid Automatically via MTN MoMo' : 'Salary Paid via MTN MoMo';
      message = hasSavingsInfo
        ? `Ekaze: You received ${numAmount.toLocaleString()} RWF salary from ${employerName} on ${dateStr} at ${timeStr}. Wallet credited: ${walletPortion.toLocaleString()} RWF (Balance: ${newWalletBalance.toLocaleString()} RWF). Saved: ${savingsPortion.toLocaleString()} RWF (Total Savings: ${newSavings.toLocaleString()} RWF).`
        : `Ekaze: You received ${numAmount.toLocaleString()} RWF salary from ${employerName} on ${dateStr} at ${timeStr}. Your wallet balance is ${newWalletBalance.toLocaleString()} RWF.`;
    }

    await sendNotification({
      userId: worker.user_id,
      title,
      message,
      type: 'payment_received',
      data: {
        referenceId: refId,
        amount: numAmount,
        wallet_balance: newWalletBalance,
        savings_credited: savingsPortion,
        savings_balance: newSavings,
        type: 'salary_received'
      }
    }).catch(() => {});

    if (workerPhone && mtnMomoService.normalizeMtnPhone(workerPhone)) {
      await sendSMS(workerPhone, message).catch(e => console.warn('Worker salary SMS error:', e.message));
    }
  }

  return {
    worker_id: worker.id,
    worker_name: workerName,
    worker_phone: workerPhone,
    amount: numAmount,
    wallet_credited: walletPortion,
    savings_credited: savingsPortion,
    wallet_balance: newWalletBalance,
    savings_balance: newSavings
  };
};

/**
 * Sends language-aware SMS + In-App notification to Employer confirming salary payout completion.
 */
const notifyEmployerPaymentSuccess = async ({
  employerUserId,
  payerPhone,
  totalAmount,
  workerSummaries = [],
  refId,
  isAutomatic = false,
  explicitLang = null
}) => {
  if (!employerUserId && !payerPhone) return;
  const mtnMomoService = require('./mtnMomoService');
  const employerUser = employerUserId ? await User.findByPk(employerUserId).catch(() => null) : null;
  const empLang = explicitLang || resolveUserLanguage(null, employerUser);
  const targetPhone = employerUser?.phone || payerPhone || '';

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB');
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const workersLabel = workerSummaries.length > 0
    ? workerSummaries.map(w => w.worker_name).filter(Boolean).join(', ')
    : (empLang === 'rw' ? 'umukozi' : 'worker');

  let title;
  let message;
  if (empLang === 'rw') {
    title = isAutomatic ? 'Kwishyura Bwikora Byagenze Neza' : 'Kwishyura Umushahara Byagenze Neza';
    message = `Ekaze: Ubwishyu ${isAutomatic ? 'bwikora ' : ''}bw'umushahara wa ${Number(totalAmount || 0).toLocaleString()} RWF kuri ${workersLabel} kuwa ${dateStr} saa ${timeStr} bwarangiye neza.`;
  } else {
    title = isAutomatic ? 'Automatic Salary Payment Successful' : 'Salary Payment Successful';
    message = `Ekaze: Your ${isAutomatic ? 'automatic ' : ''}salary payment of ${Number(totalAmount || 0).toLocaleString()} RWF to ${workersLabel} on ${dateStr} at ${timeStr} was completed successfully.`;
  }

  if (employerUserId) {
    await sendNotification({
      userId: employerUserId,
      title,
      message,
      type: 'payment_sent',
      data: {
        referenceId: refId,
        amount: Number(totalAmount || 0),
        workers: workerSummaries,
        type: 'salary_payment'
      }
    }).catch(() => {});
  }

  if (targetPhone && mtnMomoService.normalizeMtnPhone(targetPhone)) {
    await sendSMS(targetPhone, message).catch(e => console.warn('Employer salary SMS error:', e.message));
  }
};

/**
 * Settle an approved MTN MoMo salary_payment collection transaction:
 * disburses funds to each worker's MTN MoMo phone, updates wallet/savings, logs & notifies both employer & worker.
 */
const settleAutoPayrollTransaction = async (transaction) => {
  if (!transaction || transaction.status === 'successful') return;

  transaction.status = 'successful';
  await transaction.save().catch(() => {});

  const meta = transaction.metadata || {};
  const employerName = meta.sender_name || 'Employer';
  const items =
    Array.isArray(meta.workers) && meta.workers.length > 0
      ? meta.workers
      : meta.worker_id
        ? [{ worker_id: meta.worker_id, employment_id: meta.employment_id, amount: transaction.amount }]
        : [];

  const settledSummaries = [];
  for (const item of items) {
    const payAmount = Number(item.amount || 0);
    if (!item.worker_id || payAmount <= 0) continue;
    const summary = await settleSingleWorkerSalary({
      workerId: item.worker_id,
      employmentId: item.employment_id,
      payAmount,
      employerName,
      refId: transaction.reference_id,
      payoutType: meta.payout_type || 'auto_batch',
      isAutomatic: true
    });
    if (summary) settledSummaries.push(summary);
  }

  await notifyEmployerPaymentSuccess({
    employerUserId: transaction.user_id || meta.sender_id,
    payerPhone: meta.sender_phone || transaction.phone_number,
    totalAmount: Number(transaction.amount || 0),
    workerSummaries: settledSummaries,
    refId: transaction.reference_id,
    isAutomatic: true
  });
};

/**
 * Poll MTN MoMo Collection status in the background (every 5s up to 2 minutes)
 * so auto-pay or modal-closed overdue payments still disburse to worker phones immediately on approval.
 */
const scheduleAutoPayrollPoll = (referenceId) => {
  if (!referenceId || activeAutoPollRefs.has(referenceId)) return;
  activeAutoPollRefs.add(referenceId);

  const mtnMomoService = require('./mtnMomoService');
  let attempts = 0;
  const maxAttempts = 24;

  const timer = setInterval(async () => {
    attempts += 1;
    try {
      const tx = await Transaction.findOne({ where: { reference_id: referenceId } }).catch(() => null);
      if (!tx || tx.status === 'successful' || tx.status === 'failed') {
        clearInterval(timer);
        activeAutoPollRefs.delete(referenceId);
        return;
      }

      const st = await mtnMomoService.getPaymentStatus(referenceId).catch(() => ({ status: 'PENDING' }));
      if (st.status === 'SUCCESSFUL') {
        clearInterval(timer);
        activeAutoPollRefs.delete(referenceId);
        await settleAutoPayrollTransaction(tx);
      } else if (st.status === 'FAILED' || attempts >= maxAttempts) {
        clearInterval(timer);
        activeAutoPollRefs.delete(referenceId);
        tx.status = 'failed';
        tx.metadata = {
          ...(tx.metadata || {}),
          failure_reason: st.reason || 'MTN MoMo approval timed out or insufficient balance'
        };
        await tx.save().catch(() => {});
      }
    } catch (_) {
      if (attempts >= maxAttempts) {
        clearInterval(timer);
        activeAutoPollRefs.delete(referenceId);
      }
    }
  }, 5000);
};

/**
 * Main processor: Checks upcoming reminders (5 to 1 days) & overdue payments (worker, employer, agency, admin)
 */
const checkAndProcessSalaryNotifications = async () => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    // Fetch all active employments with full associations
    const employments = await Employment.findAll({
      where: { status: 'active' },
      include: [
        {
          model: Employer,
          as: 'employer',
          required: false,
          include: [{ model: User, as: 'user', required: false }]
        },
        {
          model: Worker,
          as: 'worker',
          required: false,
          include: [
            { model: User, as: 'user', required: false },
            { model: Company, as: 'company', required: false, include: [{ model: User, as: 'user', required: false }] }
          ]
        },
        {
          model: Company,
          as: 'company',
          required: false,
          include: [{ model: User, as: 'user', required: false }]
        }
      ]
    }).catch(() => []);

    if (!employments || employments.length === 0) return { processed: 0 };

    // Fetch all Admin users for admin alerts
    const adminUsers = await User.findAll({
      where: {
        role: { [Op.in]: ['admin', 'superadmin'] }
      }
    }).catch(() => []);

    let upcomingCount = 0;
    let overdueCount = 0;
    let companyEscalationsCount = 0;
    let adminAlertsCount = 0;

    for (const employment of employments) {
      const employerUser = employment.employer?.user;
      const workerUser = employment.worker?.user;
      const company = employment.company || employment.worker?.company;
      const companyUser = company?.user;

      if (!employerUser || !workerUser) continue;

      const employerName = employerUser.name || 'Employer';
      const workerName = workerUser.name || 'Worker';

      const ctx = await getEmploymentPaymentContext(employment, now);
      const paymentSource = await getEmployerPaymentSource(employerUser.id);
      const salaryFormatted = `${ctx.salary.toLocaleString()} RWF`;

      const empLang = resolveUserLanguage(null, employerUser);
      const wrkLang = resolveUserLanguage(null, workerUser);
      const empPhone = employerUser.phone || paymentSource.accountIdentifier || '';
      const wrkPhone = workerUser.phone || employment.worker?.phone || '';

      // ────────────────────────────────────────────────────────────────
      // 1. UPCOMING SALARY REMINDER (From 5th day to 1 day before due date, once a day)
      // ────────────────────────────────────────────────────────────────
      if (ctx.isUpcoming && ctx.daysDifference >= 1 && ctx.daysDifference <= 5) {
        // Ensure employer receives this notification at most once per calendar day
        const existingReminderToday = await Notification.findOne({
          where: {
            user_id: employerUser.id,
            type: 'upcoming_salary_reminder',
            created_at: { [Op.gte]: todayStart }
          }
        });

        if (!existingReminderToday) {
          let title;
          let message;
          let topupAdvice;

          if (empLang === 'rw') {
            const daysText = ctx.daysDifference === 1 ? 'ejo' : `mu minsi ${ctx.daysDifference}`;
            topupAdvice = paymentSource.isCard
              ? `Reba ko karita yawe (${paymentSource.accountIdentifier || 'bank'}) iriho byibura ${salaryFormatted}.`
              : `Kanda *182# kuri ${paymentSource.accountIdentifier || empPhone} wuzuzeho byibura ${salaryFormatted}.`;
            title = `📅 Kwibutsa: Ubwishyu bw'Umushahara ${daysText}`;
            message = `Kwibutsa: Umushahara w'umukozi wawe ${workerName} wa ${salaryFormatted} uzishyurwa ${daysText} (kuwa ${ctx.dueDateFormatted}). ${topupAdvice}`;
          } else {
            const daysText = ctx.daysDifference === 1 ? 'tomorrow' : `in ${ctx.daysDifference} days`;
            topupAdvice = paymentSource.isCard
              ? `Ensure your linked card (${paymentSource.accountIdentifier || 'card'}) has at least ${salaryFormatted}.`
              : `Dial *182# on ${paymentSource.accountIdentifier || empPhone} to top up at least ${salaryFormatted}.`;
            title = `📅 Reminder: Salary Payment Due ${ctx.daysDifference === 1 ? 'Tomorrow' : `in ${ctx.daysDifference} Days`}`;
            message = `Payroll Reminder: Salary for ${workerName} (${salaryFormatted}) is due ${daysText} (${ctx.dueDateFormatted}). ${topupAdvice}`;
          }

          await sendNotification({
            userId: employerUser.id,
            title,
            message,
            type: 'upcoming_salary_reminder',
            data: {
              category: 'payroll_reminder',
              employment_id: employment.id,
              worker_id: employment.worker_id,
              worker_name: workerName,
              amount: ctx.salary,
              due_date: ctx.dueDateFormatted,
              days_remaining: ctx.daysDifference,
              payment_source: paymentSource.accountIdentifier,
              topup_instructions: topupAdvice
            }
          });

          if (empPhone) {
            await sendSMS(empPhone, message).catch(e => console.warn('Upcoming reminder SMS warning:', e.message));
          }
          upcomingCount++;
        }
      }

      // ────────────────────────────────────────────────────────────────
      // 2. OVERDUE SALARY NOTIFICATIONS (Due date exceeded & unpaid)
      // ────────────────────────────────────────────────────────────────
      if (ctx.isOverdue) {
        // A. WORKER NOTIFICATION (Once per day)
        const workerNotifiedToday = await Notification.findOne({
          where: {
            user_id: workerUser.id,
            type: 'worker_payment_overdue',
            created_at: { [Op.gte]: todayStart }
          }
        });

        if (!workerNotifiedToday) {
          const workerTitle = wrkLang === 'rw'
            ? '⚠️ Amakuru ku Mushahara Watinze'
            : '⚠️ Overdue Salary Notice';
          const workerMsg = wrkLang === 'rw'
            ? `Menyesha: Umushahara wawe wa ${salaryFormatted} wari uteganyijwe kuwa ${ctx.dueDateFormatted} nturishyurwa na ${employerName}. Ekaze yibukije umukoresha kwishyura bidatinze.`
            : `Notice: Your scheduled salary of ${salaryFormatted} due on ${ctx.dueDateFormatted} from ${employerName} is overdue (${ctx.daysDifference} days). Ekaze has notified the employer to settle promptly.`;

          await sendNotification({
            userId: workerUser.id,
            title: workerTitle,
            message: workerMsg,
            type: 'worker_payment_overdue',
            data: {
              category: 'overdue_payment',
              employment_id: employment.id,
              employer_id: employerUser.id,
              employer_name: employerName,
              amount: ctx.salary,
              days_overdue: ctx.daysDifference,
              due_date: ctx.dueDateFormatted,
              status: 'overdue'
            }
          });
          if (wrkPhone) {
            await sendSMS(wrkPhone, workerMsg).catch(e => console.warn('Worker overdue SMS warning:', e.message));
          }
        }

        // B. EMPLOYER NOTIFICATION (Once per day)
        const employerNotifiedToday = await Notification.findOne({
          where: {
            user_id: employerUser.id,
            type: 'payment_overdue_warning',
            created_at: { [Op.gte]: todayStart }
          }
        });

        if (!employerNotifiedToday) {
          let topupUrgent;
          let empTitle;
          let empMsg;

          if (empLang === 'rw') {
            topupUrgent = paymentSource.isCard
              ? `Nyamuneka shyira amafaranga kuri karita yawe (${paymentSource.accountIdentifier || 'bank'}) cyangwa wishyure ako kanya.`
              : `Kanda *182# kuri MTN MoMo (${paymentSource.accountIdentifier || empPhone}) wuzuzeho byibura ${salaryFormatted} wishyure ako kanya.`;
            empTitle = '🚨 Ubwishyu bw\'Umushahara Bwatinze';
            empMsg = `IBYIHUTIRWA: Umushahara w'umukozi wawe (${workerName}) wa ${salaryFormatted} wari uteganyijwe kuwa ${ctx.dueDateFormatted} watinze iminsi ${ctx.daysDifference}. ${topupUrgent}`;
          } else {
            topupUrgent = paymentSource.isCard
              ? `Please ensure your card (${paymentSource.accountIdentifier || 'card'}) has sufficient funds and complete payment immediately.`
              : `Dial *182# on MTN MoMo (${paymentSource.accountIdentifier || empPhone}) to top up at least ${salaryFormatted} and pay immediately.`;
            empTitle = '🚨 Overdue Salary Payment Alert';
            empMsg = `URGENT: Salary payment for ${workerName} (${salaryFormatted}) due on ${ctx.dueDateFormatted} is overdue by ${ctx.daysDifference} days. ${topupUrgent}`;
          }

          await sendNotification({
            userId: employerUser.id,
            title: empTitle,
            message: empMsg,
            type: 'payment_overdue_warning',
            data: {
              category: 'overdue_payment',
              employment_id: employment.id,
              worker_id: employment.worker_id,
              worker_name: workerName,
              amount: ctx.salary,
              days_overdue: ctx.daysDifference,
              due_date: ctx.dueDateFormatted,
              payment_source: paymentSource.accountIdentifier,
              is_urgent: true,
              topup_guidance: topupUrgent
            }
          });
          if (empPhone) {
            await sendSMS(empPhone, empMsg).catch(e => console.warn('Employer overdue SMS warning:', e.message));
          }
          overdueCount++;
        }

        // ──────────────────────────────────────────────────────────────
        // 3. ESCALATION: Worker is for a COMPANY -> Company MUST be notified
        // ──────────────────────────────────────────────────────────────
        if (companyUser && companyUser.id) {
          const companyNotifiedToday = await Notification.findOne({
            where: {
              user_id: companyUser.id,
              type: 'company_overdue_escalation',
              created_at: { [Op.gte]: todayStart }
            }
          });

          if (!companyNotifiedToday) {
            await sendNotification({
              userId: companyUser.id,
              title: `🏢 Icyemezo cy'Ubwishyu Bwatinze: Umukozi w'Isosiyete (Agency Overdue Salary Escalation)`,
              message: `Agency Escalation Alert: Shebuja ${employerName} (Telefone: ${employerUser.phone || 'N/A'}) yananiwe kwishyura umushahara watinze wa ${salaryFormatted} ku mukozi wawe ${workerName} (Agency Placement #${employment.id}). Kwishyura byanze kubera kubura amafaranga kuri karita/telefone ya shebuja. Nyamuneka fasha mu guhuza no kugarura uyu mushahara. (Employer has an overdue salary of ${salaryFormatted} for worker ${workerName}. Insufficient employer balance. Agency mediation required).`,
              type: 'company_overdue_escalation',
              data: {
                category: 'company_escalation',
                company_id: company.id,
                company_name: company.company_name || company.name || 'Agency',
                employment_id: employment.id,
                worker_id: employment.worker_id,
                worker_name: workerName,
                employer_id: employerUser.id,
                employer_name: employerName,
                employer_phone: employerUser.phone,
                amount: ctx.salary,
                days_overdue: ctx.daysDifference,
                due_date: ctx.dueDateFormatted
              }
            });
            companyEscalationsCount++;
          }
        }

        // ──────────────────────────────────────────────────────────────
        // 4. ESCALATION: Send Ekaze ADMIN Notifications
        // ──────────────────────────────────────────────────────────────
        if (adminUsers.length > 0) {
          for (const admin of adminUsers) {
            const adminNotifiedToday = await Notification.findOne({
              where: {
                user_id: admin.id,
                type: 'admin_overdue_alert',
                created_at: { [Op.gte]: todayStart },
                data: { employment_id: employment.id }
              }
            });

            if (!adminNotifiedToday) {
              const agencyLabel = company ? `Agency: ${company.company_name || company.name || '#' + company.id}` : 'Direct Placement';
              await sendNotification({
                userId: admin.id,
                title: `🛡️ Ekaze Admin Alert: Overdue Salary Default (${employerName} -> ${workerName})`,
                message: `Compliance Default Alert: Overdue salary of ${salaryFormatted} for worker ${workerName} by employer ${employerName} (Tel: ${employerUser.phone || 'N/A'}) has exceeded payment date (${ctx.dueDateFormatted}, ${ctx.daysDifference} days overdue). Payment attempt failed due to insufficient funds on card/phone. [${agencyLabel}]. Immediate mediation required.`,
                type: 'admin_overdue_alert',
                data: {
                  category: 'admin_overdue_alert',
                  employment_id: employment.id,
                  employer_id: employerUser.id,
                  employer_name: employerName,
                  employer_phone: employerUser.phone,
                  worker_id: employment.worker_id,
                  worker_name: workerName,
                  amount: ctx.salary,
                  company_id: company ? company.id : null,
                  company_name: company ? (company.company_name || company.name) : null,
                  days_overdue: ctx.daysDifference,
                  due_date: ctx.dueDateFormatted,
                  is_urgent_admin: true
                }
              });
              adminAlertsCount++;
            }
          }
        }
      }
    }

    // ────────────────────────────────────────────────────────────────
    // 5. SMART AUTO-PAYROLL EXECUTION (Full-Balance All-or-Nothing Batch on Contract Due Date/Time)
    // ────────────────────────────────────────────────────────────────
    const mtnMomoService = require('./mtnMomoService');
    const { v4: uuidv4 } = require('uuid');
    const dueByEmployer = new Map();

    for (const employment of employments) {
      const employerUser = employment.employer?.user;
      const workerUser = employment.worker?.user;
      if (!employerUser || !workerUser) continue;

      const ctx = await getEmploymentPaymentContext(employment, now);
      if (ctx.hasRecentPaid || !ctx.salary || ctx.salary <= 0) continue;
      // Execute only when the contract payment date & time has arrived (or is overdue)
      if (now < ctx.dueDate) continue;

      const workerPhone = workerUser.phone || employment.worker?.phone || '';
      if (!mtnMomoService.normalizeMtnPhone(workerPhone)) continue;

      if (!dueByEmployer.has(employerUser.id)) {
        dueByEmployer.set(employerUser.id, { employerUser, items: [] });
      }
      dueByEmployer.get(employerUser.id).items.push({
        employment_id: employment.id,
        worker_id: employment.worker_id,
        worker_name: workerUser.name || employment.worker?.full_name || 'Worker',
        worker_phone: workerPhone,
        worker_photo: workerUser.profile_photo || null,
        worker_role: (employment.worker?.professions && employment.worker.professions[0]) || 'Domestic Worker',
        amount: ctx.salary
      });
    }

    // Reconcile any pending salary_payment transactions from the last 24h before auto-pay checks
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const staleCutoff = new Date(now.getTime() - 3 * 60 * 1000);
    const pendingSalaryTxs = await Transaction.findAll({
      where: {
        type: 'salary_payment',
        status: 'pending',
        created_at: { [Op.gte]: oneDayAgo }
      }
    }).catch(() => []);

    for (const pTx of pendingSalaryTxs) {
      const st = await mtnMomoService.getPaymentStatus(pTx.reference_id).catch(() => ({ status: 'PENDING' }));
      if (st.status === 'SUCCESSFUL') {
        await settleAutoPayrollTransaction(pTx);
      } else if (st.status === 'FAILED' || new Date(pTx.created_at) < staleCutoff) {
        pTx.status = 'failed';
        pTx.metadata = {
          ...(pTx.metadata || {}),
          failure_reason: st.reason || 'Expired or insufficient balance'
        };
        await pTx.save().catch(() => {});
      }
    }

    for (const [empUserId, group] of dueByEmployer.entries()) {
      const source = await getEmployerPaymentSource(empUserId);
      if (!source.isConfigured || !source.enabled || source.payoutMode !== 'auto_all') continue;
      const payerPhone = mtnMomoService.normalizeMtnPhone(source.accountIdentifier);
      if (!payerPhone) continue;

      // Avoid duplicate auto-pay trigger if an active pending or successful payout already ran today
      // Failed attempts (e.g. insufficient balance before employer topped up) are allowed to retry!
      const existingAutoToday = await Transaction.findOne({
        where: {
          user_id: empUserId,
          type: 'salary_payment',
          status: { [Op.in]: ['successful', 'pending'] },
          created_at: { [Op.gte]: todayStart }
        }
      }).catch(() => null);
      if (existingAutoToday) continue;

      // Sum exact full contracted salaries across ALL due workers (never pay half)
      const totalBatchAmount = group.items.reduce((sum, item) => sum + Number(item.amount), 0);
      if (totalBatchAmount <= 0) continue;

      const refId = uuidv4();
      const momoRes = await mtnMomoService.requestToPay({
        phone: payerPhone,
        amount: totalBatchAmount,
        referenceId: refId,
        externalId: refId,
        note: `EKAZE Auto Payroll (${group.items.length} workers)`
      }).catch(() => ({ success: false }));

      if (momoRes && momoRes.success) {
        await Transaction.create({
          reference_id: refId,
          user_id: empUserId,
          type: 'salary_payment',
          amount: totalBatchAmount,
          fee: 0,
          payment_method: 'mtn_momo',
          phone_number: payerPhone,
          status: 'pending',
          metadata: {
            is_batch: true,
            workers: group.items,
            worker_name: `${group.items.length} Contracted Workers`,
            worker_phone: group.items.map(i => i.worker_phone).join(', '),
            sender_id: empUserId,
            sender_name: group.employerUser.name || '',
            sender_phone: payerPhone,
            payout_type: 'auto_batch',
            notes: `Smart Automatic Full-Balance Payroll (${group.items.length} workers)`
          }
        }).catch(() => {});

        scheduleAutoPayrollPoll(refId);
      }
    }

    return {
      success: true,
      upcomingCount,
      overdueCount,
      companyEscalationsCount,
      adminAlertsCount
    };
  } catch (error) {
    console.error('❌ Salary notification processor error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Endpoint helper for Employer Payment Awareness & Topup Guidance
 */
const getEmployerPaymentAwareness = async (employerUserId) => {
  const employer = await Employer.findOne({
    where: { user_id: employerUserId }
  }).catch(() => null);

  const employerId = employer ? employer.id : null;
  const paymentSource = await getEmployerPaymentSource(employerUserId);

  const activeEmployments = await Employment.findAll({
    where: employerId ? { employer_id: employerId, status: 'active' } : { status: 'active' },
    include: [
      {
        model: Employer,
        as: 'employer',
        required: false
      },
      {
        model: Worker,
        as: 'worker',
        include: [
          { model: User, as: 'user' },
          { model: Company, as: 'company' }
        ]
      },
      {
        model: Company,
        as: 'company'
      }
    ],
    order: [['created_at', 'DESC']]
  }).catch(() => []);

  if (!activeEmployments || activeEmployments.length === 0) {
    return {
      has_active_workers: false,
      total_active_workers: 0,
      total_monthly_payroll: 0,
      total_due_amount: 0,
      workers_schedule: [],
      unpaid_workers: [],
      due_or_overdue_workers: [],
      auto_pay_enabled: paymentSource.enabled,
      is_configured: paymentSource.isConfigured,
      payout_mode: paymentSource.payoutMode,
      payment_method: paymentSource.paymentMethod,
      payment_account: paymentSource.accountIdentifier,
      message: 'No active worker contracts found.'
    };
  }

  const now = new Date();
  const workersSchedule = [];

  for (const emp of activeEmployments) {
    const workerUser = emp.worker?.user;
    const workerName = workerUser?.name || emp.worker?.full_name || 'Worker';
    const workerPhone = workerUser?.phone || emp.worker?.phone || null;
    const workerPhoto = workerUser?.profile_photo || null;
    const workerRole = (emp.worker?.professions && emp.worker.professions[0]) || 'Domestic Worker';
    const ctx = await getEmploymentPaymentContext(emp, now);

    let scheduleStatus = 'scheduled';
    if (ctx.hasRecentPaid) {
      scheduleStatus = 'paid';
    } else if (ctx.isOverdue) {
      scheduleStatus = 'overdue';
    } else if (ctx.daysDifference === 0) {
      scheduleStatus = 'due_today';
    } else if (ctx.isUpcoming) {
      scheduleStatus = 'upcoming';
    }

    workersSchedule.push({
      employment_id: emp.id,
      worker_id: emp.worker_id,
      worker_name: workerName,
      worker_phone: workerPhone,
      worker_photo: workerPhoto,
      worker_role: workerRole,
      salary_amount: ctx.salary,
      salary_formatted: `${ctx.salary.toLocaleString()} RWF`,
      contract_start_date: ctx.contractStartDate,
      payment_day: ctx.payDay,
      payment_time: ctx.paymentTime,
      due_date: ctx.dueDateFormatted,
      due_date_iso: ctx.dueDate.toISOString(),
      is_overdue: ctx.isOverdue,
      is_upcoming: ctx.isUpcoming,
      days_overdue: ctx.isOverdue ? ctx.daysDifference : 0,
      days_until_due: ctx.isUpcoming ? ctx.daysDifference : (ctx.isOverdue ? -ctx.daysDifference : ctx.daysDifference),
      has_recent_paid: ctx.hasRecentPaid,
      status: scheduleStatus
    });
  }

  const totalMonthlyPayroll = workersSchedule.reduce((sum, w) => sum + w.salary_amount, 0);
  const unpaidWorkers = workersSchedule.filter(w => !w.has_recent_paid);
  const dueOrOverdueWorkers = workersSchedule.filter(w => !w.has_recent_paid && (w.is_overdue || w.days_until_due <= 0));
  const totalDueAmount = unpaidWorkers.reduce((sum, w) => sum + w.salary_amount, 0);

  // Primary focus worker (prefer overdue/upcoming unpaid, otherwise first)
  const primary =
    dueOrOverdueWorkers[0] ||
    unpaidWorkers[0] ||
    workersSchedule[0];
  const primaryEmp = activeEmployments.find(e => e.id === primary.employment_id) || activeEmployments[0];
  const company = primaryEmp.company || primaryEmp.worker?.company;

  const targetFormatted = `${(totalDueAmount > 0 ? totalDueAmount : primary.salary_amount).toLocaleString()} RWF`;
  const momoInstructions = `Kanda *182# kuri telefoni yawe (${paymentSource.accountIdentifier || 'MTN MoMo'}) wuzuzeho byibura ${targetFormatted} kugira ngo umukozi ${unpaidWorkers.length > 1 ? `bose (${unpaidWorkers.length})` : primary.worker_name} bahembwe yose. (Dial *182# on MTN MoMo to ensure full balance of ${targetFormatted}).`;
  const cardInstructions = `Reba ko karita yawe ya banki (${paymentSource.accountIdentifier}) iriho byibura ${targetFormatted}. (Ensure your linked card has full balance of ${targetFormatted}).`;

  const anyOverdue = workersSchedule.some(w => w.is_overdue);
  if (!anyOverdue && employerUserId) {
    try {
      await Notification.destroy({
        where: {
          user_id: employerUserId,
          type: { [Op.in]: ['payment_overdue_warning', 'worker_payment_overdue'] }
        }
      });
    } catch (cleanupErr) {
      console.error('Failed clearing stale overdue notifications:', cleanupErr.message);
    }
  }

  return {
    has_active_workers: true,
    total_active_workers: workersSchedule.length,
    total_monthly_payroll: totalMonthlyPayroll,
    total_monthly_payroll_formatted: `${totalMonthlyPayroll.toLocaleString()} RWF`,
    total_due_amount: totalDueAmount,
    total_due_formatted: `${totalDueAmount.toLocaleString()} RWF`,
    workers_schedule: workersSchedule,
    unpaid_workers: unpaidWorkers,
    due_or_overdue_workers: dueOrOverdueWorkers,
    employment_id: primary.employment_id,
    worker_id: primary.worker_id,
    worker_name: primary.worker_name,
    worker_phone: primary.worker_phone,
    salary_amount: primary.salary_amount,
    salary_formatted: primary.salary_formatted,
    due_date: primary.due_date,
    payment_day: primary.payment_day,
    payment_time: primary.payment_time,
    is_overdue: workersSchedule.some(w => w.is_overdue),
    is_upcoming: workersSchedule.some(w => w.is_upcoming),
    days_overdue: primary.days_overdue,
    days_until_due: primary.days_until_due,
    has_recent_paid: unpaidWorkers.length === 0,
    auto_pay_enabled: paymentSource.enabled,
    is_configured: paymentSource.isConfigured,
    payout_mode: paymentSource.payoutMode,
    payment_method: paymentSource.paymentMethod,
    payment_account: paymentSource.accountIdentifier,
    is_card: paymentSource.isCard,
    topup_instructions: {
      momo: momoInstructions,
      card: cardInstructions,
      active_instructions: paymentSource.isCard ? cardInstructions : momoInstructions
    },
    company_info: company ? {
      id: company.id,
      name: company.company_name || company.name || 'Placement Agency',
      is_notified: primary.is_overdue
    } : null,
    needs_attention: workersSchedule.some(w => w.is_overdue || w.is_upcoming)
  };
};

module.exports = {
  checkAndProcessSalaryNotifications,
  getEmployerPaymentAwareness,
  getEmploymentPaymentContext,
  getEmployerPaymentSource,
  settleSingleWorkerSalary,
  notifyEmployerPaymentSuccess,
  settleAutoPayrollTransaction,
  scheduleAutoPayrollPoll
};
