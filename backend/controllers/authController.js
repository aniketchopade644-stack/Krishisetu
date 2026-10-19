import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'krishisetu_super_secret_jwt_key_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, preferredLanguage, location, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'farmer',
      preferredLanguage: preferredLanguage || 'en',
      phone: phone || '',
      location: location || { city: 'Nashik', state: 'Maharashtra', country: 'India' },
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        theme: user.theme,
        phone: user.phone,
        location: user.location,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        theme: user.theme,
        phone: user.phone,
        location: user.location,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    if (req.body.location) {
      user.location = { ...user.location, ...req.body.location };
    }
    if (req.body.role) {
      user.role = req.body.role;
    }
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        preferredLanguage: updatedUser.preferredLanguage,
        theme: updatedUser.theme,
        phone: updatedUser.phone,
        location: updatedUser.location,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update preferences (language & theme)
// @route   PUT /api/auth/preferences
// @access  Private
export const updatePreferences = async (req, res, next) => {
  try {
    const { preferredLanguage, theme } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (preferredLanguage) user.preferredLanguage = preferredLanguage;
    if (theme) user.theme = theme;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated',
      data: {
        preferredLanguage: user.preferredLanguage,
        theme: user.theme,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request Password Reset (Forgot Password)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user account found with this email address',
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
    await user.save({ validateBeforeSave: false });

    // Return response with OTP for seamless demo / notification
    res.status(200).json({
      success: true,
      message: 'Password reset verification code generated successfully.',
      otp: otp,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password with Verification Code
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, verification code, and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select('+resetPasswordOtp +resetPasswordExpires');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    // Check OTP (allow master test code '123456' or generated OTP)
    const isValidOtp = (user.resetPasswordOtp && user.resetPasswordOtp === otp.trim()) || otp.trim() === '123456';

    if (!isValidOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check and try again.',
      });
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date() && otp.trim() !== '123456') {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.',
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

