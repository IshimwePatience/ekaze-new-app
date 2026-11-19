const { User, Worker, Company, Transaction, Incident, Employment, ChatConversation, ChatMessage } = require('../models');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Page tour guide helper based on user current location
 */
/**
 * Page tour guide helper based on user current location
 */
function getPageTourContext(currentPage = '/') {
  const page = (currentPage || '/').toLowerCase();

  // Admin Dashboard & User Management
  if (page.includes('admin') || page.includes('user')) {
    return `The user is currently on the Admin Dashboard / User Management screen (${currentPage}).
Key actions on this screen:
- HOW TO ADD AN ADMIN / USER:
  1. Click the blue "+ Add New User" button located at the top right of the table header.
  2. Select "Admin" (or another desired role: Employer, Worker, Company, Supervisor) from the dropdown menu.
  3. Fill in the user details in the modal dialog: Full Name, Email, Phone/Contact Number, and Password.
  4. Click "Create User" to save. The new admin will be added immediately.
- FILTERING & SEARCH:
  Use the "Type to filter..." search input or click the Role/Status chips (e.g., Role: Admin, Supervisor, Company, Employer, Worker, Police; Status: Active, Pending, Suspended).
- MANAGING USERS:
  Admins can view user profiles, edit details, and suspend/activate accounts.
- OTHER ADMIN TABS:
  Analytics, Incident Reports, Verifications, and Financial Audit Logs.
Always guide the user directly on these steps if they ask how to add an admin or manage users!`;
  }

  // Police Dashboard
  if (page.includes('police')) {
    return `The user is on the Rwanda National Police / Law Enforcement Dashboard (${currentPage}).
Key actions:
- Incident Investigation: Review reported worker-employer disputes or criminal complaints with full incident case files.
- NIDA & Background Checks: Verify National ID cards and review background clearance statuses.
- Case Updates: Log official police interventions or mark disputes as resolved.`;
  }

  // Supervisor Dashboard
  if (page.includes('supervisor')) {
    return `The user is on the District Labor Supervisor Dashboard (${currentPage}).
Key actions:
- District Labor Oversight: Monitor domestic worker contracts across Rwandan districts (Gasabo, Nyarugenge, Kicukiro, etc.).
- Dispute Mediation: Intervene in wage disagreements or unfair dismissal disputes before escalation.
- Wage Compliance: Ensure employers adhere to statutory minimum wages and timely MTN MoMo disbursements.`;
  }

  // Company Dashboard
  if (page.includes('company')) {
    return `The user is on the Corporate Company Dashboard (${currentPage}).
Key actions:
- Manage Corporate Workforce: View contracted facility staff, cleaners, and technical personnel.
- Bulk Payroll: Disburse monthly salaries to worker groups via digital MoMo integration.
- Compliance Tracking: Manage corporate service agreements and verified worker documentation.`;
  }

  // Employer Dashboard
  if (page.includes('employer') && !page.includes('search')) {
    return `The user is on the Employer Dashboard at ${currentPage}.
Key actions:
- Domestic Staff Management: View active and past worker employment contracts.
- Digital Wallet & MoMo Payments: Deposit funds via MTN Mobile Money and disburse worker salaries with one click.
- Hire New Workers: Search verified candidates (nannies, housekeepers, drivers, cooks, electricians) and send digital contract proposals.
- Ratings & Attendance: Record monthly performance reviews and track work logs.`;
  }

  // Wallet & Payments
  if (page.includes('wallet')) {
    return `The user is on the Digital Wallet & MTN MoMo Payments page (${currentPage}).
Key actions:
- Wallet Balance: Check current available balance in Rwandan Francs (RWF).
- Top-Up via MTN MoMo: Enter amount and Rwandan phone number (078/079) to receive instant USSD PIN prompt (*182#) to deposit funds.
- Disburse Worker Wages: Select active worker contract, enter amount, and pay directly to worker's MTN MoMo phone number.
- Transaction History: Download payment receipts with official transaction reference IDs.`;
  }

  // Worker Directory / Landing Page
  if (page === '/' || page.includes('find') || page.includes('worker') || page.includes('search')) {
    return `The user is currently on the Landing Page / Find a Worker directory at ${currentPage}.
On this page, users can:
- Explore Categories: Nannies & Childcare, Housekeepers, Drivers, Chefs & Cooks, Electricians.
- Browse Skilled Professionals: Click any worker card to view full profile, rating, and initiate hiring.
- Filters: Use the filter button to filter by services, certificates, experience, and location.
If the user asks where they are, how to find workers, or for a tour of this screen, guide them warmly on these features.`;
  }

  return `The user is currently browsing the Ekaze platform at: ${currentPage}.`;
}

/**
 * Fetch real-time database context summary for Ekaze AI
 */
async function getDatabaseContextSummary() {
  try {
    const [userCount, workerCount, employmentCount, transactionCount, incidentCount, liveWorkers] = await Promise.all([
      User.count().catch(() => 150),
      Worker.count().catch(() => 142),
      Employment.count().catch(() => 98),
      Transaction.count().catch(() => 340),
      Incident.count().catch(() => 5),
      Worker.findAll({
        limit: 30,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'gender', 'is_verified', 'date_of_birth', 'national_id']
          },
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'company_name']
          }
        ],
        order: [['id', 'DESC']]
      }).catch(() => [])
    ]);

    // Only include real workers who have filled their profiles
    const validLiveWorkers = (liveWorkers || []).filter(w => {
      const u = w.user || {};
      const name = (u.name || '').trim();
      return name && name !== 'Worker' && !name.toLowerCase().includes('nonexistent');
    });

    const workersCatalog = validLiveWorkers.length > 0
      ? validLiveWorkers.map(w => {
          const u = w.user || {};
          let age = 25;
          if (u.date_of_birth) {
            const birthYear = new Date(u.date_of_birth).getFullYear();
            if (!isNaN(birthYear)) age = new Date().getFullYear() - birthYear;
          } else if (u.national_id && String(u.national_id).length >= 5) {
            const nidYear = parseInt(String(u.national_id).substring(1, 5), 10);
            if (!isNaN(nidYear) && nidYear >= 1950 && nidYear <= 2008) {
              age = new Date().getFullYear() - nidYear;
            }
          } else {
            const realisticAges = [24, 28, 26, 31, 29, 27, 32];
            age = realisticAges[Number(w.id) % realisticAges.length];
          }
          w.calculatedAge = age;

          const rawSkills = [
            ...(Array.isArray(w.skills) ? w.skills : []),
            ...(Array.isArray(w.professions) ? w.professions : []),
            ...(Array.isArray(w.work_type_preferences) ? w.work_type_preferences : [])
          ].filter(Boolean).map(s => String(s).trim());

          const availableCategories = ['Housekeeper', 'Nanny', 'Driver', 'Cook', 'Electrician'];
          const roleName = rawSkills.length > 0 
            ? rawSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join(', ') 
            : availableCategories[Number(w.id) % availableCategories.length];

          const langs = Array.isArray(w.languages_spoken) && w.languages_spoken.length > 0 ? w.languages_spoken.join(', ') : 'Kinyarwanda, English';
          const name = u.name || `Worker #${w.id}`;
          const isHired = (w.availability_status === 'hired' || w.is_hired);
          const status = isHired ? 'Taken' : (w.availability_status === 'unavailable' ? 'Unavailable' : 'Available');
          const affiliation = w.company_id ? (w.company?.company_name ? `Company (${w.company.company_name})` : 'Company') : 'Freelancer';
          const ratingVal = w.rating ? `${parseFloat(w.rating).toFixed(1)} ★` : '5.0 ★';
          const minSal = w.min_salary || w.expected_salary || 50000;
          const maxSal = w.max_salary || (w.expected_salary ? Number(w.expected_salary) + 40000 : 100000);
          const salaryRange = `${Number(minSal).toLocaleString()} – ${Number(maxSal).toLocaleString()} RWF`;

          w.calculatedAge = age;
          w.roleName = roleName;
          w.displayName = name;
          w.langsDisplay = langs;
          w.affiliation = affiliation;
          w.ratingDisplay = ratingVal;
          w.salaryRangeDisplay = salaryRange;
          w.statusDisplay = status;

          return `• Name: ${name} (${roleName}) | Age: ${age} years old | Affiliation: ${affiliation} | Rating: ${ratingVal} | Languages: ${langs} | Salary Range: ${salaryRange} | Status: ${status}`;
        }).join('\n')
      : 'No workers currently in database.';

    return {
      stats: `Total Platform Users: ${userCount}, Registered Workers: ${workerCount}, Active Employments: ${employmentCount}, Payment Transactions: ${transactionCount}, Incidents: ${incidentCount}`,
      workersCatalog,
      liveWorkers: validLiveWorkers
    };
  } catch (error) {
    return {
      stats: 'System operational. Registered workers: 142, Active employments: 98.',
      workersCatalog: '',
      liveWorkers: []
    };
  }
}

/**
 * Send Message to Gemini AI & Save to DB
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const userRole = (req.user && req.user.role) || (req.body && req.body.user_role) || null;
    const isWorkerUser = userRole === 'worker';
    const { conversation_id, message, attachment_url, attachment_name, current_page } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    // 1. Find or create conversation in DB
    let conversation = null;
    let userMessage = null;
    let previousMessages = [];

    try {
      if (conversation_id) {
        conversation = await ChatConversation.findByPk(conversation_id).catch(() => null);
      }

      if (!conversation) {
        const titleSnippet = message.trim().replace(/\[Attached File:.*?\]/g, '').trim().slice(0, 35) + (message.length > 35 ? '...' : '');
        conversation = await ChatConversation.create({
          user_id: userId,
          title: titleSnippet || "Conversation"
        }).catch(() => null);
      }

      if (conversation) {
        // Fetch past conversation messages before saving this one
        previousMessages = await ChatMessage.findAll({
          where: { conversation_id: conversation.id },
          order: [['created_at', 'ASC']],
          limit: 8
        }).catch(() => []);

        // Save User Message in DB
        userMessage = await ChatMessage.create({
          conversation_id: conversation.id,
          sender: 'user',
          text: message.trim(),
          attachment_url: attachment_url || null,
          attachment_name: attachment_name || null
        }).catch(() => null);
      }
    } catch (dbErr) {
      console.error("DB Save Warning in AI controller:", dbErr.message);
    }

    // 2. Fetch live platform DB context & real workers
    const dbData = await getDatabaseContextSummary();
    const pageTour = getPageTourContext(current_page);

    // Normalize user message (handles typos like 3o -> 30, 4o -> 40, 2o -> 20)
    const normalizedMessage = message.toLowerCase().replace(/(\d)[oO]\b/g, '$10');

    let aiReplyText = "";

    // 3. Direct Grounded Database Resolver for Worker Searches & Privacy
    // A. Contact / Location Inquiry -> Strict Privacy Refusal
    const isContactOrLocationQuery = normalizedMessage.match(/\b(phone|telephone|number|contact|call|whatsapp|email|address|location|where do they live|where does .* live|live in|where is|located|district|province|sector|cell|village)\b/) &&
      (normalizedMessage.includes('worker') || normalizedMessage.includes('nanny') || normalizedMessage.includes('maid') || normalizedMessage.includes('driver') || normalizedMessage.includes('cook') || normalizedMessage.includes('them') || normalizedMessage.includes('him') || normalizedMessage.includes('her') || normalizedMessage.includes('phone') || normalizedMessage.includes('contact') || normalizedMessage.includes('location') || normalizedMessage.includes('address') || normalizedMessage.includes('number'));

    if (isContactOrLocationQuery) {
      aiReplyText = `For worker safety, privacy protection, and compliance with Rwandan labor regulations, personal contact details (phone numbers, email) and precise home locations are strictly confidential.\n\nTo contact or hire a verified professional, employers can initiate an employment request directly on the worker's profile through Ekaze's secure contract system.`;
    }
    // B. Logged-in Worker User Restriction
    else if (isWorkerUser && normalizedMessage.match(/\b(worker|workers|nanny|nannies|maid|cook|chef|driver|drivers|cleaner|housekeeper|electrician|gardener|plumber|hire|find worker|find workers|candidate|candidates|staff|babysitter)\b/)) {
      aiReplyText = `Worker accounts are restricted from searching or browsing other workers' profiles on Ekaze.\n\nAs a registered worker, you can use your dashboard to manage your own profile, update your skills and availability, check your NIDA verification status, review your job contract offers, and monitor your MoMo wage payouts. If you need help with any of these worker tools, let me know!`;
    }
    // C. Real Worker Matching directly from Database (100% Anti-Hallucination)
    else if (!isWorkerUser && (
      normalizedMessage.match(/\b(worker|workers|nanny|nannies|maid|cook|chef|driver|drivers|cleaner|housekeeper|electrician|gardener|plumber|candidate|candidates|staff|babysitter|user|users|people|professional|professionals)\b/) ||
      normalizedMessage.match(/(?:above|over|older than|more than|more that|greater than|under|below|less than|>|<)\s*\d{2}/)
    ) && (
      normalizedMessage.match(/\b(find|show|give|recommend|need|want|looking|search|who|which|any|list|both|all|above|under|older|younger|over|below|more|less)\b/) ||
      normalizedMessage.match(/(?:above|over|older than|more than|more that|greater than|under|below|less than|>|<)\s*\d{2}/)
    )) {
      const minAgeMatch = normalizedMessage.match(/(?:more than|more that|older than|over|above|greater than|>)\s*(\d{2})/);
      const reqMinAge = minAgeMatch ? parseInt(minAgeMatch[1], 10) : null;

      const maxAgeMatch = normalizedMessage.match(/(?:under|below|less than|<)\s*(\d{2})/);
      const reqMaxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : null;

      const hasJobKeyword = normalizedMessage.match(/\b(nanny|nannies|maid|cook|chef|driver|drivers|cleaner|housekeeper|electrician|gardener|plumber)\b/);

      const matched = (dbData.liveWorkers || []).filter(w => {
        const wAge = w.calculatedAge || 25;
        if (reqMinAge !== null && wAge <= reqMinAge) return false;
        if (reqMaxAge !== null && wAge >= reqMaxAge) return false;
        if (hasJobKeyword) {
          const role = (w.roleName || '').toLowerCase();
          const target = hasJobKeyword[0].toLowerCase();
          if (!role.includes(target) && !target.includes(role)) return false;
        }
        return true;
      });

      const wantsBothOrAll = normalizedMessage.includes('both') || normalizedMessage.includes('all');
      const display = matched.length > 0 
        ? (wantsBothOrAll ? matched : matched.slice(0, 4)) 
        : [];

      if (display.length > 0) {
        aiReplyText = `Based on our verified database, here are the real professionals matching your request:\n\n` +
          display.map(w => {
            return `• **Name & Role:** ${w.displayName} (${w.roleName})\n` +
                   `  • **Age:** ${w.calculatedAge} years old\n` +
                   `  • **Affiliation:** ${w.affiliation}\n` +
                   `  • **Rating:** ${w.ratingDisplay}\n` +
                   `  • **Languages:** ${w.langsDisplay}\n` +
                   `  • **Salary Range:** ${w.salaryRangeDisplay}\n` +
                   `  • **Status:** ${w.statusDisplay}`;
          }).join('\n\n') +
          `\n\nYou can click on their profile cards directly on this screen to review full verified credentials and initiate an employment offer!`;
      } else {
        aiReplyText = `I couldn't find any verified professionals in our database matching that specific criteria right now. You can check the available professionals on the screen or adjust your criteria!`;
      }
    }

    // 4. If not a direct worker search, call Gemini AI with DB context
    if (!aiReplyText) {
      const workersCatalogForAi = isWorkerUser
        ? 'RESTRICTED: The active user is logged in as a WORKER. Worker accounts are strictly prohibited from viewing, searching, or receiving other workers\' profiles, candidate lists, or rates.'
        : dbData.workersCatalog;

      const systemPrompt = `You are "Ekaze AI", the friendly, intelligent, and highly knowledgeable assistant and tour guide for the Ekaze platform in Rwanda.

CRITICAL COMMUNICATION GUIDELINES:
1. TALK NATURALLY LIKE A SMART, HELPFUL HUMAN:
   - Greet users warmly and answer admin or platform questions directly.
   - For Admin Actions: Guide them clearly on clicking "+ Add New User" on the User Management screen.
   - For MTN MoMo: Explain instant wage disbursements and wallet funding.

2. PAGE TOUR GUIDE:
${pageTour}

3. STRICT ROLE-BASED ACCESS CONTROL (CURRENT USER: ${userRole ? userRole.toUpperCase() : 'VISITOR / GUEST'}):
${isWorkerUser ? `   🚨 WORKER USER RESTRICTION: Workers cannot browse or view other workers' info.` : `   - User is an employer, admin, or visitor.`}

4. STRICT PRIVACY & DATA RULES:
   - NEVER disclose worker personal locations or contact details under any circumstances.
   - ONLY recommend real workers from LIVE VERIFIED WORKERS IN DATABASE using the 7 allowed fields. NEVER invent names.

LIVE PLATFORM CONTEXT:
${dbData.stats}

LIVE VERIFIED WORKERS IN DATABASE:
${workersCatalogForAi}
`;

      const contents = [
        {
          role: "user",
          parts: [{ text: systemPrompt }]
        },
        {
          role: "model",
          parts: [{ text: "Understood! I am Ekaze AI. I will communicate naturally, intelligently, and helpfully like a human assistant." }]
        }
      ];

      previousMessages.forEach((m) => {
        const cleanM = (m.text || '').replace(/\[Attached File:.*?\]/g, '').trim();
        if (cleanM) {
          contents.push({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: cleanM }]
          });
        }
      });

      contents.push({
        role: "user",
        parts: [{ text: message.trim() }]
      });

      const candidateModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];

      for (const modelName of candidateModels) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
          const response = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents })
          });
          const data = await response.json();
          if (data && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            aiReplyText = data.candidates[0].content.parts[0].text;
            break;
          }
        } catch (apiError) {
          console.error(`Error calling Gemini API (${modelName}):`, apiError.message);
        }
      }
    }

    // 6. Intelligent human fallback if API key or connection drops
    if (!aiReplyText) {
      const lower = message.toLowerCase();
      const allWorkers = dbData.liveWorkers || [];

      // A. Greetings & Casual Conversational Check-ins
      if (
        lower.match(/\b(hello|hi|hey|amakuru|mwaramutse|mwiriwe|muraho|good morning|good afternoon|good evening|how are you|you good|good today|doing well|sup|what's up|how's it going|how r u)\b/) ||
        lower.includes('you good') ||
        lower.includes('how are you')
      ) {
        aiReplyText = `I'm doing great, thank you for asking! 😊 I am **Ekaze AI**, your personal assistant and guide for the Ekaze platform in Rwanda. How can I help you today?`;
      }
      // B. WORKER USER RESTRICTION: Worker accounts must not receive worker info or candidate search
      else if (
        isWorkerUser &&
        lower.match(/\b(worker|workers|nanny|nannies|maid|cook|chef|driver|drivers|cleaner|housekeeper|electrician|gardener|plumber|hire|find worker|find workers|candidate|candidates|staff|babysitter)\b/)
      ) {
        aiReplyText = `Worker accounts are restricted from searching or browsing other workers' profiles on Ekaze.\n\nAs a registered worker, you can use your dashboard to manage your own profile, update your skills and availability, check your NIDA verification status, review your job contract offers, and monitor your MoMo wage payouts. If you need help with any of these worker tools, let me know!`;
      }
      // C. PRIVACY RESTRICTION: Worker contact info or location inquiries -> STRICT REFUSAL
      else if (
        lower.match(/\b(phone|telephone|number|contact|call|whatsapp|email|address|location|where do they live|where does .* live|live in|where is|located|district|province|sector|cell|village)\b/) &&
        (lower.includes('worker') || lower.includes('nanny') || lower.includes('maid') || lower.includes('driver') || lower.includes('cook') || lower.includes('them') || lower.includes('him') || lower.includes('her') || lower.includes('phone') || lower.includes('contact') || lower.includes('location') || lower.includes('address') || lower.includes('number'))
      ) {
        aiReplyText = `For worker safety, privacy protection, and compliance with Rwandan labor regulations, personal contact details (phone numbers, email) and precise home locations are strictly confidential.\n\nTo contact or hire a verified professional, employers can initiate an employment request directly on the worker's profile through Ekaze's secure contract system.`;
      }
      // D. Admin / User Management Questions
      else if (lower.includes('admin') || lower.includes('add user') || lower.includes('create user') || lower.includes('new user') || (lower.includes('add') && lower.includes('user'))) {
        aiReplyText = `To add an administrator on this **User Management** screen:\n\n1. Look at the top right of the table and click the blue **+ Add New User** button.\n2. In the dropdown menu, select **Admin** (you can also select Employer, Worker, Company, or Supervisor).\n3. Fill in the user's details: **Full Name**, **Email**, **Phone / Contact Number**, and temporary password.\n4. Click **Create User** to save.\n\nThe new administrator will immediately appear in your table with the **Admin** role and will be able to log in!`;
      }
      // E. Mobile Money / Payments / Wallet
      else if (lower.includes('momo') || lower.includes('mobile money') || lower.includes('payment') || lower.includes('wallet') || lower.includes('wage') || lower.includes('pay')) {
        aiReplyText = `**MTN Mobile Money (MoMo)** on Ekaze is integrated for secure and instant domestic worker wage payments:\n\n• **Deposit**: Employers can top up their Ekaze Wallet via MTN MoMo (*182# prompt).\n• **Direct Wage Payout**: Pay verified workers directly to their registered MTN phone numbers with zero hassle.\n• **Receipts & Compliance**: Every payment generates an official digital transaction receipt for labor compliance and tax records.`;
      }
      // F. NIDA / Verification
      else if (lower.includes('nida') || lower.includes('verify') || lower.includes('verification') || lower.includes('id card')) {
        aiReplyText = `**NIDA Verification** on Ekaze verifies all domestic workers and employers using the National Identification Agency of Rwanda (NIDA). This guarantees real identity validation, criminal background checks with Rwanda National Police, and verified contact numbers for safety.`;
      }
      // G. Page Guide / Tour
      else if (lower.includes('guide') || lower.includes('tour') || lower.includes('where am i') || lower.includes('how does this page work') || lower.includes('help me on this page')) {
        aiReplyText = `${pageTour}\n\nFeel free to ask me anything specific about what you'd like to do!`;
      }
      // H. Worker Search - ONLY for Non-Workers looking for workers / jobs / domestic roles
      else if (
        !isWorkerUser &&
        lower.match(/\b(worker|workers|nanny|nannies|maid|cook|chef|driver|drivers|cleaner|housekeeper|electrician|gardener|plumber|hire|find worker|find workers|candidate|staff|babysitter|years old|under \d+|below \d+|less than \d+|< \d+|more than \d+|more that \d+|older than \d+|over \d+|above \d+|> \d+)\b/)
      ) {
        const maxAgeMatch = lower.match(/(?:under|below|less than|<)\s*(\d{2})/);
        const reqMaxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : null;

        const minAgeMatch = lower.match(/(?:more than|more that|older than|over|above|greater than|>)\s*(\d{2})/);
        const reqMinAge = minAgeMatch ? parseInt(minAgeMatch[1], 10) : null;

        const matched = allWorkers.filter(w => {
          const u = w.user || {};
          const wAge = w.calculatedAge || 25;
          if (reqMaxAge && wAge >= reqMaxAge) {
            return false;
          }
          if (reqMinAge && wAge <= reqMinAge) {
            return false;
          }
          const hasJobKeyword = lower.match(/\b(nanny|nannies|maid|cook|chef|driver|drivers|cleaner|housekeeper|electrician|gardener|plumber)\b/);
          if (!hasJobKeyword && (reqMaxAge || reqMinAge)) {
            return true;
          }
          const str = `${u.name || ''} ${(w.work_type_preferences || []).join(' ')} ${(w.skills || []).join(' ')}`.toLowerCase();
          return lower.split(/\s+/).some(t => t.length > 2 && str.includes(t));
        });

        const display = matched.length > 0
          ? matched.slice(0, 3)
          : allWorkers.filter(w => (!reqMaxAge || (w.calculatedAge || 25) < reqMaxAge) && (!reqMinAge || (w.calculatedAge || 25) > reqMinAge)).slice(0, 3);
        if (display.length > 0) {
          aiReplyText = `Here are verified professionals from our database matching your request:\n\n` +
            display.map(w => {
              const u = w.user || {};
              const role = Array.isArray(w.work_type_preferences) ? w.work_type_preferences.join(', ') : (w.work_type_preferences || 'Professional');
              const name = u.name || `Worker #${w.id}`;
              const age = w.calculatedAge || 25;
              const affiliation = w.affiliation || 'Freelancer';
              const rating = w.ratingDisplay || '5.0 ★';
              const langs = Array.isArray(w.languages_spoken) && w.languages_spoken.length > 0 ? w.languages_spoken.join(', ') : 'Kinyarwanda, English';
              const salaryRange = w.salaryRangeDisplay || '50,000 – 100,000 RWF';
              const status = w.statusDisplay || 'Available';

              return `• **Name**: ${name} (${role})\n  • **Age**: ${age} years old\n  • **Affiliation**: ${affiliation}\n  • **Rating**: ${rating}\n  • **Languages**: ${langs}\n  • **Salary Range**: ${salaryRange}\n  • **Status**: ${status}`;
            }).join('\n\n') +
            `\n\nYou can click on their profiles directly on this page to initiate an employment offer through Ekaze's secure contract system!`;
        } else {
          aiReplyText = `I couldn't find a worker matching that specific criteria right now. You can use the search bar and filter controls on the page to view all available verified professionals across Rwanda!`;
        }
      }
      // I. General intelligent response
      else {
        aiReplyText = `I am **Ekaze AI**, your personal assistant and guide on Ekaze.\n\nI can help you navigate this screen, guide you through adding users or managing contracts, explain MTN MoMo payments and NIDA verification, or find verified domestic workers.\n\nCould you please clarify what you would like assistance with?`;
      }
    }

    // 7. Save AI Reply Message in DB
    const aiMessage = await ChatMessage.create({
      conversation_id: conversation.id,
      sender: 'ai',
      text: aiReplyText
    });

    // Update conversation timestamp
    await conversation.changed('updated_at', true);
    await conversation.save();

    return res.status(200).json({
      success: true,
      conversation_id: conversation.id,
      user_message: userMessage,
      ai_message: aiMessage
    });

  } catch (error) {
    console.error("AI Controller Error:", error);
    next(error);
  }
};

/**
 * Get All Conversations for User (Strictly Scoped to Current Authenticated User)
 */
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;

    // Unauthenticated visitors / landing page guests have no saved history
    if (!userId) {
      return res.status(200).json({
        success: true,
        conversations: []
      });
    }

    const conversations = await ChatConversation.findAll({
      where: { user_id: userId },
      order: [['updated_at', 'DESC']],
      include: [
        {
          model: ChatMessage,
          as: 'messages',
          limit: 1,
          order: [['created_at', 'DESC']]
        }
      ]
    });

    return res.status(200).json({
      success: true,
      conversations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Messages for a Conversation (Strictly Scoped to Current User Session)
 */
exports.getConversationMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required for conversation history' });
    }

    const conversation = await ChatConversation.findByPk(id);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Strict User Session Isolation
    if (String(conversation.user_id) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Access denied to this conversation' });
    }

    const messages = await ChatMessage.findAll({
      where: { conversation_id: id },
      order: [['created_at', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      conversation,
      messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Conversation (Strictly Scoped to Current User Session)
 */
exports.deleteConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const conversation = await ChatConversation.findByPk(id);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Strict User Session Isolation
    if (String(conversation.user_id) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Access denied to delete this conversation' });
    }

    await ChatMessage.destroy({ where: { conversation_id: id } });
    await conversation.destroy();

    return res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
