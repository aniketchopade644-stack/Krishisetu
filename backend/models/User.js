import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: ['farmer', 'seller', 'admin'],
      default: 'farmer',
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'hi', 'mr'],
      default: 'en',
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      city: { type: String, default: 'Nashik' },
      state: { type: String, default: 'Maharashtra' },
      country: { type: String, default: 'India' },
      pincode: { type: String, default: '' },
    },
    avatar: {
      type: String,
      default: '',
    },
    resetPasswordOtp: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
