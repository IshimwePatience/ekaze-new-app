const { Op } = require('sequelize');
const { HelpFeedback, User, Notification, AuditLog } = require('../models');

// Helper to generate readable ticket number
const generateTicketNumber = () => {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `HFB-${timestamp}-${randomSuffix}`;
};

/**
 * @desc Create new help request or feedback (Public landing page or Authenticated user)
 * @route POST /api/v1/help-feedback
 * @access Public / Authenticated
 */
exports.createFeedback = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      role: bodyRole,
      type = 'feedback',
      category = 'General Feedback',
      subject,
      message,
      page_url,
      screenshot,
      browser_info
    } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A description or message is required.'
      });
    }

    // Determine user association if authenticated
    let userId = null;
    let finalRole = bodyRole || 'guest';
    let finalName = name ? name.trim() : '';
    let finalEmail = email ? email.trim() : '';
    let finalPhone = phone ? phone.trim() : '';

    if (req.user) {
      userId = req.user.id;
      finalRole = req.user.role || bodyRole || 'user';
      finalName = finalName || req.user.name || req.user.username || '';
      finalEmail = finalEmail || req.user.email || '';
      finalPhone = finalPhone || req.user.phone || '';
    }

    const ticketNumber = generateTicketNumber();

    const newRecord = await HelpFeedback.create({
      ticket_number: ticketNumber,
      user_id: userId,
      name: finalName || 'Anonymous',
      email: finalEmail || null,
      phone: finalPhone || null,
      role: finalRole,
      type: type || 'feedback',
      category: category || 'General Feedback',
      subject: subject ? subject.trim() : null,
      message: message.trim(),
      page_url: page_url || null,
      screenshot: screenshot || null,
      browser_info: browser_info || null,
      status: 'pending'
    });

    // Optionally notify admins
    try {
      const adminUsers = await User.findAll({ where: { role: 'admin' }, attributes: ['id'] });
      for (const admin of adminUsers) {
        await Notification.create({
          user_id: admin.id,
          title: `New ${type.toUpperCase()}: ${ticketNumber}`,
          message: `${finalName || 'A user'} submitted a ${type} ticket regarding: ${subject || category}`,
          type: 'support',
          data: { ticket_number: ticketNumber, feedback_id: newRecord.id }
        }).catch(() => {});
      }
    } catch (notifErr) {
      // Non-fatal
    }

    return res.status(201).json({
      success: true,
      message: 'Your help request / feedback has been received. Our team will review it shortly.',
      data: newRecord
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all help requests & feedbacks with filters (Admin only)
 * @route GET /api/v1/help-feedback
 * @access Admin
 */
exports.getAllFeedback = async (req, res, next) => {
  try {
    const {
      status,
      type,
      category,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const where = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search && search.trim()) {
      const query = `%${search.trim()}%`;
      where[Op.or] = [
        { ticket_number: { [Op.iLike]: query } },
        { name: { [Op.iLike]: query } },
        { email: { [Op.iLike]: query } },
        { subject: { [Op.iLike]: query } },
        { message: { [Op.iLike]: query } }
      ];
    }

    const { count, rows } = await HelpFeedback.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'role', 'profile_photo']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    return res.status(200).json({
      success: true,
      data: rows,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get aggregate statistics for tickets & feedback
 * @route GET /api/v1/help-feedback/stats
 * @access Admin
 */
exports.getFeedbackStats = async (req, res, next) => {
  try {
    const total = await HelpFeedback.count();
    const pending = await HelpFeedback.count({ where: { status: 'pending' } });
    const in_progress = await HelpFeedback.count({ where: { status: 'in_progress' } });
    const resolved = await HelpFeedback.count({ where: { status: 'resolved' } });
    const bugReports = await HelpFeedback.count({ where: { type: 'bug' } });
    const featureRequests = await HelpFeedback.count({ where: { type: 'feature' } });

    return res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        in_progress,
        resolved,
        bugs: bugReports,
        features: featureRequests
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update feedback status or admin response notes
 * @route PUT /api/v1/help-feedback/:id/status
 * @access Admin
 */
exports.updateFeedbackStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const record = await HelpFeedback.findByPk(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Feedback record not found.'
      });
    }

    if (status) record.status = status;
    if (admin_notes !== undefined) {
      record.admin_notes = String(admin_notes)
        .replace(/by Administrator/gi, 'by Ihirwe')
        .replace(/by Admin/gi, 'by Ihirwe')
        .replace(/Administrator/gi, 'Ihirwe')
        .replace(/Admin/gi, 'Ihirwe');
    }

    if (status === 'resolved' && !record.resolved_at) {
      record.resolved_at = new Date();
    }

    await record.save();

    // Notify user on reply or status update
    let targetUserId = record.user_id;
    if (!targetUserId && record.email) {
      try {
        const matchedUser = await User.findOne({ where: { email: record.email }, attributes: ['id'] });
        if (matchedUser) {
          targetUserId = matchedUser.id;
        }
      } catch (err) {}
    }

    if (targetUserId) {
      const isResolved = status === 'resolved';
      const cleanNote = (record.admin_notes || '')
        .replace(/by Administrator/gi, 'by Ihirwe')
        .replace(/by Admin/gi, 'by Ihirwe')
        .replace(/Administrator/gi, 'Ihirwe')
        .replace(/Admin/gi, 'Ihirwe');
      const title = isResolved
        ? `Issue Resolved: ${record.ticket_number}`
        : `Ihirwe Response: ${record.ticket_number}`;
      const message = cleanNote
        ? `Ihirwe Response: ${cleanNote}`
        : `Your support inquiry (${record.ticket_number}) status is now ${record.status}.`;

      await Notification.create({
        user_id: targetUserId,
        title,
        message,
        type: 'support',
        data: { ticket_number: record.ticket_number, feedback_id: record.id, status: record.status }
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: 'Status updated successfully.',
      data: record
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete feedback ticket (Admin only)
 * @route DELETE /api/v1/help-feedback/:id
 * @access Admin
 */
exports.deleteFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await HelpFeedback.findByPk(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Feedback record not found.'
      });
    }

    await record.destroy();

    return res.status(200).json({
      success: true,
      message: 'Feedback ticket deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
