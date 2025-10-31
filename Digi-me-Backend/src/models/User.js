const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SocialLinksSchema = new mongoose.Schema(
  {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i, 'Invalid email format'],
    },
    passwordHash: { type: String, required: true },
    
    username: { 
      type: String, 
      unique: true, 
      sparse: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [20, 'Username must be no more than 20 characters long'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
      validate: {
        validator: function(v) {
          if (!v) return true;
          return !v.startsWith('_') && !v.endsWith('_') && !v.includes('__');
        },
        message: 'Username cannot start/end with underscore or contain consecutive underscores',
      },
    },

    bio: { type: String, default: '' },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },

    // ✅ Profile Picture
    avatarUrl: { type: String, default: '' },

    // ✅ New Cover Photo Field
    coverAvatar: { type: String, default: '' },

    socialLinks: { type: SocialLinksSchema, default: () => ({}) },
    businessLinks: [{ type: String }],

    // ✅ Saved Profiles (Bookmarks)
    savedProfiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    googleId: { type: String, index: true },

    qrCodeUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

// ✅ Password comparison and hashing
UserSchema.methods.comparePassword = async function comparePassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

UserSchema.statics.hashPassword = async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

module.exports = mongoose.model('User', UserSchema);
