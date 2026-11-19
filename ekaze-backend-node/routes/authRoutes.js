const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, protectOptional } = require('../middleware/auth');
const { authRateLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const Joi = require('joi');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const profileUploadDir = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(profileUploadDir)) {
  fs.mkdirSync(profileUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profileUploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `profile-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  }
});
const upload = multer({ storage });

const loginSchema = {
  body: Joi.object({
    login: Joi.string().required(),
    password: Joi.string().required(),
    language: Joi.string().optional().allow('', null)
  }).unknown(true)
};

router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/google', authRateLimiter, authController.googleLogin);
router.post('/register/worker', authRateLimiter, upload.any(), authController.registerWorker);
router.post('/register/employer', authRateLimiter, upload.any(), authController.registerEmployer);
router.post('/register/company', authRateLimiter, upload.any(), authController.registerCompany);
router.post('/check-unique', authController.checkUnique);
router.post('/send-verification-code', protectOptional, authController.sendVerificationCode);
router.post('/verify-verification-code', protectOptional, authController.verifyVerificationCode);
router.post('/otp/verify', authController.verifyOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/otp/resend', authController.resendOtp);
router.post('/resend-otp', authController.resendOtp);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.me);
router.put('/profile', protect, authController.updateProfile);

// Device Sessions (Max 3 Devices Management)
router.get('/sessions', protect, authController.getActiveSessions);
router.delete('/sessions/:id', protect, authController.revokeSession);

// Two-Factor Authentication (MFA)
router.post('/login/verify-mfa', authController.verifyLoginMfa);
router.post('/login/resend-mfa', authController.resendLoginMfa);
router.get('/mfa/status', protect, authController.getMfaStatus);
router.post('/mfa/setup', protect, authController.setupMfa);
router.post('/mfa/send-code', protect, authController.sendMfaCode);
router.post('/mfa/verify', protect, authController.verifyMfa);
router.post('/mfa/disable', protect, authController.disableMfa);

module.exports = router;
