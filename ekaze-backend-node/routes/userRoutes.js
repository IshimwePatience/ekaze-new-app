const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/statistics', userController.getStatistics);
router.get('/by-role/:role', userController.getUsersByRole);
router.get('/by-status/:status', userController.getUsersByStatus);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.post('/:id/activate', userController.activateUser);
router.post('/:id/suspend', userController.suspendUser);
router.post('/:id/verify', userController.verifyUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
