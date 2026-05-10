const User = require('../models/User');
const Order = require('../models/Order');

// @desc  Get all users (Admin)
// @route GET /api/users
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// @desc  Update user role (Admin)
// @route PUT /api/users/:id/role
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User role updated', user });
  } catch (error) {
    next(error);
  }
};

// @desc  Toggle user active status (Admin)
// @route PUT /api/users/:id/toggle
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    next(error);
  }
};

// @desc  Get user stats (Admin)
// @route GET /api/users/stats
const getUserStats = async (req, res, next) => {
  try {
    const [totalUsers, adminUsers, activeUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ isActive: true }),
    ]);
    res.json({ success: true, stats: { totalUsers, adminUsers, activeUsers } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, updateUserRole, toggleUserStatus, getUserStats };
