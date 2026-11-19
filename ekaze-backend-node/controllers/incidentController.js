const { Incident, Worker, User, Employer, Company } = require('../models');
const { Op } = require('sequelize');
const { sendNotification } = require('../services/socketService');

const createIncident = async (req, res, next) => {
  try {
    const { worker_id, title, description, incident_type, proof_files, province, district, sector } = req.body;

    const incident = await Incident.create({
      reporter_id: req.user.id,
      worker_id,
      title,
      description,
      incident_type,
      proof_files: proof_files || [],
      province,
      district,
      sector,
      status: 'reported'
    });

    // Send real-time notification to Police officers, Admin, and involved parties
    try {
      const recipients = await User.findAll({
        where: { role: { [Op.in]: ['police', 'admin'] } }
      }).catch(() => []);

      for (const r of recipients) {
        sendNotification({
          userId: r.id,
          title: `🚨 Incident Alert: ${title || incident_type || 'New Case'}`,
          message: `New incident (${incident_type || 'General'}) recorded. Case #INC-${incident.id}. Location: ${district || 'Gasabo'}.`,
          type: 'warning',
          data: { incident_id: incident.id }
        }).catch(() => {});
      }

      if (worker_id) {
        const worker = await Worker.findByPk(worker_id).catch(() => null);
        if (worker?.user_id && worker.user_id !== req.user.id) {
          sendNotification({
            userId: worker.user_id,
            title: `⚠️ Incident Logged Involving Your Employment`,
            message: `An incident (${title || incident_type}) has been recorded for review.`,
            type: 'warning',
            data: { incident_id: incident.id }
          }).catch(() => {});
        }
      }
    } catch (notifErr) {
      console.error('Failed to dispatch incident notification:', notifErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Incident reported successfully and routed to local police jurisdiction',
      data: incident
    });
  } catch (error) {
    next(error);
  }
};

const getIncidents = async (req, res, next) => {
  try {
    let where = {};
    const andConditions = [];

    if (req.user?.role === 'worker') {
      const worker = await Worker.findOne({ where: { user_id: req.user.id } });
      if (worker) where.worker_id = worker.id;
    } else if (req.user?.role === 'employer') {
      where.reporter_id = req.user.id;
    } else if (req.user?.role === 'police') {
      // Police officers view incidents in their assigned jurisdiction or all
    } else if (req.user?.role === 'supervisor') {
      const userDistrict = req.user.district || 'Gasabo';
      andConditions.push({
        [Op.or]: [
          { district: { [Op.iLike]: `%${userDistrict}%` } },
          { incident_location: { [Op.iLike]: `%${userDistrict}%` } }
        ]
      });
    }

    if (req.query.status && req.query.status !== 'all') {
      where.status = req.query.status;
    }
    if (req.query.incident_type && req.query.incident_type !== 'all') {
      where.incident_type = req.query.incident_type;
    }
    if (req.query.search && req.query.search.trim()) {
      const s = `%${req.query.search.trim()}%`;
      andConditions.push({
        [Op.or]: [
          { incident_number: { [Op.iLike]: s } },
          { title: { [Op.iLike]: s } },
          { description: { [Op.iLike]: s } },
          { incident_location: { [Op.iLike]: s } }
        ]
      });
    }

    if (andConditions.length > 0) {
      where[Op.and] = andConditions;
    }

    const incidents = await Incident.findAll({
      where,
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'name', 'phone', 'profile_photo'] },
        { 
          model: Worker, 
          as: 'worker', 
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'phone', 'national_id', 'profile_photo'] }] 
        },
        {
          model: Employer,
          as: 'employer',
          required: false,
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'phone', 'email', 'profile_photo'] }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({ success: true, count: incidents.length, data: incidents });
  } catch (error) {
    next(error);
  }
};

const getIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findByPk(req.params.id, {
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'name', 'phone', 'profile_photo'] },
        { 
          model: Worker, 
          as: 'worker', 
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'phone', 'national_id', 'profile_photo'] }] 
        },
        {
          model: Employer,
          as: 'employer',
          required: false,
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'phone', 'email', 'profile_photo'] }]
        }
      ]
    });
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }
    return res.status(200).json({ success: true, data: incident });
  } catch (error) {
    next(error);
  }
};

const getIncidentStatistics = async (req, res, next) => {
  try {
    let baseWhere = {};
    if (req.user?.role === 'supervisor') {
      const userDistrict = req.user.district || 'Gasabo';
      baseWhere = {
        [Op.or]: [
          { district: { [Op.iLike]: `%${userDistrict}%` } },
          { incident_location: { [Op.iLike]: `%${userDistrict}%` } }
        ]
      };
    }

    const total = await Incident.count({ where: baseWhere }).catch(() => 0);
    const reported = await Incident.count({ where: { ...baseWhere, status: 'reported' } }).catch(() => 0);
    const under_investigation = await Incident.count({ where: { ...baseWhere, status: 'under_investigation' } }).catch(() => 0);
    const resolved = await Incident.count({ where: { ...baseWhere, status: 'resolved' } }).catch(() => 0);
    const dismissed = await Incident.count({ where: { ...baseWhere, status: 'dismissed' } }).catch(() => 0);
    const escalated = await Incident.count({ where: { ...baseWhere, status: 'escalated' } }).catch(() => 0);

    const types = [
      'theft', 'violence', 'negligence', 'breach_of_contract', 'misconduct',
      'non_payment', 'unsafe_conditions', 'harassment', 'wrongful_termination', 'other'
    ];
    const by_type = {};
    for (const t of types) {
      by_type[t] = await Incident.count({ where: { ...baseWhere, incident_type: t } }).catch(() => 0);
    }

    return res.status(200).json({
      success: true,
      data: {
        total,
        total_incidents: total,
        by_status: {
          reported,
          under_investigation,
          resolved,
          dismissed,
          escalated
        },
        by_type,
        today: 0,
        this_week: 0,
        this_month: total,
        unassigned: 0,
        open_cases: reported + under_investigation
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findByPk(req.params.id);
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });

    const { status, investigation_notes, title, description, incident_type } = req.body;

    // Check if user is editing incident content (title, description, type, etc.)
    const isEditingContent = title !== undefined || description !== undefined || incident_type !== undefined;
    if (isEditingContent) {
      // 1. Only the creator who reported it is allowed to edit it
      const isCreator = req.user && Number(incident.reporter_id) === Number(req.user.id);
      if (!isCreator) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied: No one else is allowed to edit this incident except the incident creator who reported it.'
        });
      }

      // 2. Only allowed if not marked as in follow-up, under investigation, or resolved
      const restrictedStatuses = [
        'under_investigation',
        'investigating',
        'in_progress',
        'follow_up',
        'resolved',
        'dismissed',
        'escalated',
        'closed'
      ];
      const currentStatus = (incident.status || '').toLowerCase();
      if (restrictedStatuses.includes(currentStatus) || currentStatus !== 'reported') {
        return res.status(400).json({
          success: false,
          message: `Cannot edit incident: Incidents in follow-up, under investigation, or resolved cannot be edited.`
        });
      }
    }

    if (status) incident.status = status;
    if (investigation_notes !== undefined) incident.investigation_notes = investigation_notes;
    if (title) incident.title = title;
    if (description) incident.description = description;
    if (incident_type) incident.incident_type = incident_type;
    await incident.save();

    // Send status update notification
    try {
      if (status && incident.reporter_id) {
        sendNotification({
          userId: incident.reporter_id,
          title: `📋 Incident Status: ${status.replace(/_/g, ' ').toUpperCase()}`,
          message: `Case #INC-${incident.id} status has been updated to "${status}".`,
          type: 'info',
          data: { incident_id: incident.id, status }
        }).catch(() => {});
      }
    } catch (notifErr) {
      console.error('Failed to dispatch incident update notification:', notifErr.message);
    }

    return res.status(200).json({ success: true, message: 'Incident updated successfully', data: incident });
  } catch (error) {
    next(error);
  }
};

const deleteIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findByPk(req.params.id);
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });

    // 1. Only the creator who reported it is allowed to delete it
    const isCreator = req.user && Number(incident.reporter_id) === Number(req.user.id);
    if (!isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Only the user who reported this incident is allowed to delete it.'
      });
    }

    // 2. Only allowed if not marked as in follow-up, under investigation, or resolved
    const restrictedStatuses = [
      'under_investigation',
      'investigating',
      'in_progress',
      'follow_up',
      'resolved',
      'dismissed',
      'escalated',
      'closed'
    ];
    const currentStatus = (incident.status || '').toLowerCase();
    if (restrictedStatuses.includes(currentStatus) || currentStatus !== 'reported') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete incident: Incidents in follow-up, under investigation, or resolved cannot be deleted.`
      });
    }

    await incident.destroy();
    return res.status(200).json({ success: true, message: 'Incident deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIncident,
  getIncidents,
  getIncident,
  getIncidentStatistics,
  updateIncident,
  deleteIncident
};

