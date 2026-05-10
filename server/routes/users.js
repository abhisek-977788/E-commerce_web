const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, toggleUserStatus, getUserStats } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.use(protect, admin);
router.get('/', getAllUsers);
router.get('/stats', getUserStats);
router.put('/:id/role', updateUserRole);
router.put('/:id/toggle', toggleUserStatus);

module.exports = router;
