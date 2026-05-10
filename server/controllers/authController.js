const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

// @desc  Register user
// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Login user
// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account has been deactivated' });
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get profile
// @route GET /api/auth/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'title thumbnail discountedPrice');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc  Update profile
// @route PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    next(error);
  }
};

// @desc  Add/Update address
// @route POST /api/auth/address
const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const addressData = req.body;
    if (addressData.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }
    user.addresses.push(addressData);
    await user.save();
    res.json({ success: true, message: 'Address added', addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete address
// @route DELETE /api/auth/address/:addressId
const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
    await user.save();
    res.json({ success: true, message: 'Address removed', addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// @desc  Change password
// @route PUT /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc  Wishlist toggle
// @route POST /api/auth/wishlist/:productId
const toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;
    const index = user.wishlist.indexOf(productId);
    let message;
    if (index > -1) {
      user.wishlist.splice(index, 1);
      message = 'Removed from wishlist';
    } else {
      user.wishlist.push(productId);
      message = 'Added to wishlist';
    }
    await user.save();
    res.json({ success: true, message, wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile, addAddress, deleteAddress, changePassword, toggleWishlist };
