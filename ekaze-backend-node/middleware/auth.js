const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User, Session, Company, Worker, Employer } = require('../models');
const { normalizeLangCode } = require('../services/smsService');

const syncUserLanguageHeader = (user, req) => {
  try {
    const reqLang = normalizeLangCode(
      req?.query?.lang ||
      req?.body?.language ||
      req?.body?.preferred_language ||
      req?.headers?.['x-language']
    );
    if (user && reqLang && user.preferred_language !== reqLang) {
      user.preferred_language = reqLang;
      User.update({ preferred_language: reqLang }, { where: { id: user.id } }).catch(() => {});
    }
  } catch (_) {}
};

const protect = async (req, res, next) => {
  let token;

  // 1. Extract token from httpOnly cookie or Authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.'
    });
  }

  try {
    // 2. Verify JWT signature
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // 3. Strict session verification in DB
    const session = await Session.findOne({
      where: {
        token: token
      }
    });

    if (session) {
      if (!session.is_valid || new Date(session.expires_at) < new Date()) {
        return res.status(401).json({
          success: false,
          message: 'Session has been revoked or expired. Please log in again.'
        });
      }
    }

    // 4. Fetch User with profile associations
    const user = await User.findByPk(decoded.id, {
      include: [
        { model: Company, as: 'company' },
        { model: Worker, as: 'worker' },
        { model: Employer, as: 'employer' }
      ]
    });

    if (!user || user.status === 'suspended' || user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'User account is inactive or suspended.'
      });
    }

    syncUserLanguageHeader(user, req);
    req.user = user;
    req.sessionId = session ? session.id : null;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

const protectOptional = async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      include: [
        { model: Employer, as: 'employer' },
        { model: Worker, as: 'worker' },
        { model: Company, as: 'company' }
      ]
    });
    if (user) {
      syncUserLanguageHeader(user, req);
      req.user = user;
    }
  } catch (error) {
    // optional, continue
  }
  next();
};

module.exports = { protect, protectOptional };
