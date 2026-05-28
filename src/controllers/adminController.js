const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * GET /admin/profile - Get admin profile
 * Authorization: Admin only
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const userData = {
      id: user._id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || null,
      avatar_url: user.avatar_url || null,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return res.status(200).json({ success: true, data: userData });
  } catch (error) {
    console.error('Error in getProfile:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /admin/settings - Update admin settings/profile
 * Authorization: Admin only
 */
const updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone } = req.body;

    const user = await User.findById(userId);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    if (full_name) user.full_name = full_name;
    if (phone) user.phone = phone;

    await user.save();

    const userData = {
      id: user._id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || null,
      avatar_url: user.avatar_url || null,
      role: user.role,
      status: user.status
    };

    return res.status(200).json({ success: true, message: 'Settings updated', data: userData });
  } catch (error) {
    console.error('Error in updateSettings:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /admin/dashboard-stats - Get dashboard statistics
 * Authorization: Admin only
 */
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    // Count total users
    const totalUsers = await User.countDocuments();

    // Count active users
    const activeUsers = await User.countDocuments({ status: 'active' });

    // Count pending registrations
    const pendingUsers = await User.countDocuments({ status: 'pending' });

    const stats = {
      totalUsers,
      activeUsers,
      pendingUsers,
      registrationDate: user.createdAt
    };

    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProfile,
  updateSettings,
  getDashboardStats
};
