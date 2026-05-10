const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, addAddress, deleteAddress, changePassword, toggleWishlist } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/address', protect, addAddress);
router.delete('/address/:addressId', protect, deleteAddress);
router.put('/change-password', protect, changePassword);
router.post('/wishlist/:productId', protect, toggleWishlist);

module.exports = router;
