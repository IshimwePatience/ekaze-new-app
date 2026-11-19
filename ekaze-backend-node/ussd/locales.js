// USSD Localization Strings (Kinyarwanda & English)
const locales = {
  kin: {
    select_language: "Hitamo Ururimi:\n1. Ikinyarwanda\n2. English",
    welcome: (name) => `Murakaza neza kuri Ekaze, ${name || 'Mukunzi'}!`,
    not_registered: "Ntabwo iyi numero yanditse kuri Ekaze.\nKanda 1 wiyandikishe cyangwa sura ekaze.rw kuri internet.",
    
    // PIN Setup & Verification
    setup_pin_prompt: "Shyiraho umubare w'ibanga wa USSD (PIN y'imibare 4):",
    confirm_pin_prompt: "Subiramo umubare w'ibanga (PIN y'imibare 4):",
    pin_setup_success: "PIN yawe yemejwe neza! Ongera uhamagare *789# ukomeze.",
    pin_mismatch: "PIN zombi ntizihuye. Ongera ugerageze.",
    enter_pin: "Shyiramo PIN yawe y'imibare 4:",
    invalid_pin: "PIN washyizemo si yo. Ongera ugerageze.",
    
    // Worker Menu
    worker_menu: "EKAZE - UMUKOZI\n1. Reba Amafaranga kuri Konti\n2. Reba Ubwizigame bwanjye\n3. Bikuza kuri MoMo / Airtel\n4. Bika mu Bwizigame\n5. Amasezerano y'Akazi\n9. Hindura Ururimi\n0. Soba",
    balance_display: (available, pending) => `EKAZE WALLET:\nAmafaranga ufite: ${Number(available).toLocaleString()} RWF\nAyari gutegerejwe: ${Number(pending).toLocaleString()} RWF\n\n0. Subira inyuma`,
    savings_display: (savings, monthlyDeduction) => `UBWIZIGAME:\nUbwizigame bwose: ${Number(savings).toLocaleString()} RWF\nIbyizigamirwa ku kwezi: ${Number(monthlyDeduction || 0).toLocaleString()} RWF\n\n0. Subira inyuma`,
    
    // Withdrawal
    withdraw_amount_prompt: (available) => `Amafaranga ushobora kubikuza: ${Number(available).toLocaleString()} RWF\nShyiramo ingano y'ayo ushaka kubikuza:`,
    withdraw_pin_prompt: (amount, phone) => `Wemeje kubikuza ${Number(amount).toLocaleString()} RWF kuri ${phone}?\nShyiramo PIN yawe kwemeza:`,
    withdraw_insufficient: (available) => `Amafaranga ufite ntabwo ahagije. Ufite: ${Number(available).toLocaleString()} RWF.`,
    withdraw_success: (amount, phone, txRef) => `Ububiko bwawe bwakiriwe!\n${Number(amount).toLocaleString()} RWF yoherejwe kuri ${phone}.\nNimero y'ubutumwa: ${txRef}.`,
    withdraw_min_error: "Ntushobora kubikuza munsi ya 500 RWF.",
    
    // Manual Saving from Balance
    save_amount_prompt: (available) => `Amafaranga ufite: ${Number(available).toLocaleString()} RWF\nShyiramo ingano y'ayo ushaka kubika mu bwizigame:`,
    save_pin_prompt: (amount) => `Wemeje kubika ${Number(amount).toLocaleString()} RWF mu bwizigame?\nShyiramo PIN yawe kwemeza:`,
    save_success: (amount, newSavings) => `Amafaranga yabitswe neza!\n${Number(amount).toLocaleString()} RWF yongerewe mu bwizigame.\nUbwizigame bwose ubu: ${Number(newSavings).toLocaleString()} RWF.`,
    
    // Contracts
    active_employment: (employer, salary, startDate) => `AMASEZERANO Y'AKAZI:\nUmukoresha: ${employer}\nUmushahara: ${Number(salary).toLocaleString()} RWF\nItariki yatangiriyeho: ${startDate}\n\n0. Subira inyuma`,
    no_active_employment: "Nta masezerano y'akazi afunguye ufite kuri ubu.\n\n0. Subira inyuma",

    // Employer Menu
    employer_menu: "EKAZE - UMUKORESHA\n1. Reba Ubwizigame bw'Abakozi\n2. Ihemba ry'Umukozi\n3. Reba Amafaranga ari muri Escrow\n9. Hindura Ururimi\n0. Soba",
    employer_select_worker: "Hitamo umukozi ushaka kurebera ubwizigame:\n",
    employer_worker_savings: (workerName, savings, monthlyRemittance) => `UBWIZIGAME BW'UMUKOZI:\nUmukozi: ${workerName}\nUbwizigame bwose: ${Number(savings).toLocaleString()} RWF\nUmusanzu w'ukwezi: ${Number(monthlyRemittance).toLocaleString()} RWF\n\n0. Subira inyuma`,
    no_workers_found: "Nta mukozi wigeze wandikisha kuri ubu.\n\n0. Subira inyuma",
    employer_escrow_display: (escrow) => `EKAZE ESCROW BALANCE:\nAmafaranga ari mu bwiteganyirize bw'ihemba: ${Number(escrow).toLocaleString()} RWF\n\n0. Subira inyuma`,
    
    // Language change
    language_changed: "Ururimi rwahinduwe mu Kinyarwanda.",
    exit_msg: "Murakoze gukoresha Ekaze. Umunsi mwiza!"
  },

  en: {
    select_language: "Select Language:\n1. Ikinyarwanda\n2. English",
    welcome: (name) => `Welcome to Ekaze, ${name || 'User'}!`,
    not_registered: "This phone number is not registered on Ekaze.\nPress 1 to register or visit ekaze.rw on web.",
    
    // PIN Setup & Verification
    setup_pin_prompt: "Create your 4-digit USSD Security PIN:",
    confirm_pin_prompt: "Confirm your 4-digit USSD Security PIN:",
    pin_setup_success: "Your PIN has been set successfully! Please dial *789# again to continue.",
    pin_mismatch: "PIN entries do not match. Please try again.",
    enter_pin: "Enter your 4-digit Security PIN:",
    invalid_pin: "Invalid PIN. Please try again.",
    
    // Worker Menu
    worker_menu: "EKAZE - WORKER\n1. Check Wallet Balance\n2. Check Savings Vault\n3. Withdraw to MoMo / Airtel\n4. Save from Balance to Vault\n5. View Employment Contract\n9. Change Language\n0. Exit",
    balance_display: (available, pending) => `EKAZE WALLET:\nAvailable Balance: ${Number(available).toLocaleString()} RWF\nPending Salary: ${Number(pending).toLocaleString()} RWF\n\n0. Back`,
    savings_display: (savings, monthlyDeduction) => `SAVINGS VAULT:\nTotal Accumulated: ${Number(savings).toLocaleString()} RWF\nMonthly Target: ${Number(monthlyDeduction || 0).toLocaleString()} RWF\n\n0. Back`,
    
    // Withdrawal
    withdraw_amount_prompt: (available) => `Available for withdrawal: ${Number(available).toLocaleString()} RWF\nEnter amount to withdraw:`,
    withdraw_pin_prompt: (amount, phone) => `Confirm withdraw ${Number(amount).toLocaleString()} RWF to ${phone}?\nEnter your 4-digit PIN:`,
    withdraw_insufficient: (available) => `Insufficient balance. Available: ${Number(available).toLocaleString()} RWF.`,
    withdraw_success: (amount, phone, txRef) => `Withdrawal successful!\n${Number(amount).toLocaleString()} RWF sent to ${phone}.\nTransaction Ref: ${txRef}.`,
    withdraw_min_error: "Minimum withdrawal amount is 500 RWF.",
    
    // Manual Saving from Balance
    save_amount_prompt: (available) => `Available balance: ${Number(available).toLocaleString()} RWF\nEnter amount to transfer to savings vault:`,
    save_pin_prompt: (amount) => `Confirm transferring ${Number(amount).toLocaleString()} RWF to savings?\nEnter your 4-digit PIN:`,
    save_success: (amount, newSavings) => `Savings updated successfully!\n${Number(amount).toLocaleString()} RWF deposited to vault.\nNew Total Savings: ${Number(newSavings).toLocaleString()} RWF.`,
    
    // Contracts
    active_employment: (employer, salary, startDate) => `ACTIVE CONTRACT:\nEmployer: ${employer}\nMonthly Wage: ${Number(salary).toLocaleString()} RWF\nStart Date: ${startDate}\n\n0. Back`,
    no_active_employment: "You have no active employment contract registered.\n\n0. Back",

    // Employer Menu
    employer_menu: "EKAZE - EMPLOYER\n1. Check Worker Savings\n2. Approve Salary Payout\n3. View Escrow Account Balance\n9. Change Language\n0. Exit",
    employer_select_worker: "Select a worker to check savings:\n",
    employer_worker_savings: (workerName, savings, monthlyRemittance) => `WORKER SAVINGS REPORT:\nWorker: ${workerName}\nTotal Savings: ${Number(savings).toLocaleString()} RWF\nMonthly Contribution: ${Number(monthlyRemittance).toLocaleString()} RWF\n\n0. Back`,
    no_workers_found: "You have no active domestic staff linked to your account.\n\n0. Back",
    employer_escrow_display: (escrow) => `EKAZE ESCROW ACCOUNT:\nPre-funded Escrow Balance: ${Number(escrow).toLocaleString()} RWF\n\n0. Back`,
    
    // Language change
    language_changed: "Language changed to English.",
    exit_msg: "Thank you for using Ekaze. Have a great day!"
  }
};

module.exports = locales;
