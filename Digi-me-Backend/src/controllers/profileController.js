const path = require('path');
const fs = require('fs');
// const Fuse = require('fuse.js');
const User = require('../models/User');
const { validateUsername, validatePhone, validateBio ,validateEmail} = require('../utils/validation');
const { sendEmailNotification , sendpasswordNotification} = require('../config/mailer');

// async function getMyProfile(req, res) {
//   const user = await User.findById(req.user.id);
//   if (!user) return res.status(404).json({ message: 'Not found' });
//   res.json(sanitiseUser(user));
// }

// async function updateMyProfile(req, res) {
//   let updates = filterProfileFields(req.body);

//   // ✅ allow direct fields (filter blocks them)
//   if (req.body.website !== undefined) updates.website = req.body.website;
//   if (req.body.bio !== undefined) updates.bio = req.body.bio;

//   // ✅ Parse socialLinks if string
//   if (typeof req.body.socialLinks === "string") {
//     try {
//       updates.socialLinks = JSON.parse(req.body.socialLinks);
//     } catch (e) {
//       console.log("❌ Error parsing socialLinks", e);
//     }
//   }

//   // ✅ Validation
//   if (updates.username !== undefined) {
//     const usernameValidation = validateUsername(updates.username);
//     if (!usernameValidation.isValid) {
//       return res.status(400).json({ message: usernameValidation.message });
//     }

//     const existingUser = await User.findOne({
//       username: updates.username,
//       _id: { $ne: req.user.id },
//     });
//     if (existingUser) {
//       return res.status(409).json({ message: "Username already in use" });
//     }
//   }

//   if (updates.phone !== undefined) {
//     const phoneValidation = validatePhone(updates.phone);
//     if (!phoneValidation.isValid) {
//       return res.status(400).json({ message: phoneValidation.message });
//     }
//   }

//   if (updates.bio !== undefined) {
//     const bioValidation = validateBio(updates.bio);
//     if (!bioValidation.isValid) {
//       return res.status(400).json({ message: bioValidation.message });
//     }
//   }

//   // ✅ Avatar Upload
//   if (req.files?.avatar) {
//     updates.avatarUrl = `/uploads/${req.files.avatar[0].filename}`;
//   }

//   // ✅ Cover Upload
//   if (req.files?.coverAvatar) {
//     updates.coverAvatar = `/uploads/${req.files.coverAvatar[0].filename}`;
//   }

//   try {
//     const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
//     res.json(sanitiseUser(user));
//   } catch (err) {
//     console.error("Profile update error:", err);
//     res.status(500).json({ message: "Profile update failed" });
//   }
// }



// async function deleteMyProfile(req, res) {
//   await User.findByIdAndDelete(req.user.id);
//   res.json({ message: 'Account deleted' });
// }

// async function getPublicProfileByUsername(req, res) {
//   const { username } = req.params;
//   const user = await User.findOne({ username }).select('-passwordHash -resetPasswordToken -resetPasswordExpires');
//   if (!user) return res.status(404).json({ message: 'Not found' });
//   res.json(publicUser(user));
// }

// async function getPublicProfileById(req, res) {
//   const { id } = req.params;
//   const user = await User.findById(id).select('-passwordHash -resetPasswordToken -resetPasswordExpires');
//   if (!user) return res.status(404).json({ message: 'Not found' });
//   res.json(publicUser(user));
// }

// // Fuzzy search profiles by username/email/bio/phone with typo tolerance
// // async function searchProfiles(req, res) {
// //   const { q } = req.query;
// //   const query = (q || '').toString().trim();
// //   if (!query) return res.status(400).json({ message: 'Missing query parameter q' });

// //   // Fetch a limited set to keep in-memory search efficient
// //   const candidates = await User.find({}, 'username email bio phone avatarUrl socialLinks businessLinks')
// //     .limit(1000)
// //     .lean();

// //   // Normalize query: collapse spaces; users may add extra spaces or minor typos
// //   const normalizedQuery = query.replace(/\s+/g, ' ').toLowerCase();

// //   const fuse = new Fuse(candidates, {
// //     includeScore: true,
// //     threshold: 0.4, // lower is stricter; 0.4 allows minor typos
// //     ignoreLocation: true,
// //     minMatchCharLength: 2,
// //     keys: [
// //       { name: 'username', weight: 0.6 },
// //       { name: 'email', weight: 0.3 },
// //       { name: 'bio', weight: 0.07 },
// //       { name: 'phone', weight: 0.03 },
// //     ],
// //   });

// //   const results = fuse.search(normalizedQuery).slice(0, 20);
// //   const data = results.map(r => publicUser(r.item));
// //   res.json({ query, count: data.length, results: data });
// // }

// function filterProfileFields(body) {
//   const allowed = ['username', 'bio', 'phone', 'socialLinks', 'businessLinks'];
//   const updates = {};
//   for (const key of allowed) if (body[key] !== undefined) updates[key] = body[key];
//   return updates;
// }

// function sanitiseUser(user) {
//   return {
//     id: user._id,
//     email: user.email,
//     username: user.username,
//     bio: user.bio,
//     phone: user.phone,
//     avatarUrl: user.avatarUrl,
//     socialLinks: user.socialLinks,
//     businessLinks: user.businessLinks,
//   };
// }

// function publicUser(user) {
//   return {
//     id: user._id,
//     username: user.username,
//     bio: user.bio,
//     phone: user.phone,
//     avatarUrl: user.avatarUrl,
//     socialLinks: user.socialLinks,
//     businessLinks: user.businessLinks,
//     qrCodeUrl: user.qrCodeUrl,
//   };
// }

async function getMyProfile(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(sanitiseUser(user));
}

async function updateMyProfile(req, res) {
  let updates = {};

  // ✅ Parse JSON payload from FormData
  if (req.body.json) {
    try {
      updates = JSON.parse(req.body.json);
    } catch (err) {
      console.error("Failed to parse JSON payload:", err);
      return res.status(400).json({ message: "Invalid JSON" });
    }
  }

  // ✅ File uploads
  if (req.files?.avatar) updates.avatarUrl = `/uploads/${req.files.avatar[0].filename}`;
  if (req.files?.coverAvatar) updates.coverAvatar = `/uploads/${req.files.coverAvatar[0].filename}`;

  // ✅ Validations
  if (updates.username) {
    const usernameValidation = validateUsername(updates.username);
    if (!usernameValidation.isValid) return res.status(400).json({ message: usernameValidation.message });

    const existingUser = await User.findOne({ username: updates.username, _id: { $ne: req.user.id } });
    if (existingUser) return res.status(409).json({ message: "Username already in use" });
  }

  if (updates.email) {
    const emailValidation = validateEmail(updates.email);
    if (!emailValidation.isValid) return res.status(400).json({ message: emailValidation.message });
  }

  if (updates.phone) {
    const phoneValidation = validatePhone(updates.phone);
    if (!phoneValidation.isValid) return res.status(400).json({ message: phoneValidation.message });
  }

  if (updates.bio) {
    const bioValidation = validateBio(updates.bio);
    if (!bioValidation.isValid) return res.status(400).json({ message: bioValidation.message });
  }

  // ✅ Social links normalization
  if (updates.socialLinks) {
    const links = updates.socialLinks;
    updates.socialLinks = {
      facebook: links[0]?.url || links.facebook || "" ,
      instagram: links[1]?.url || links.instagram || "" ,
      linkedin: links[2]?.url || links.linkedin || "" ,
      whatsapp: links[3]?.url || links.whatsapp || "" ,
    };
  }

   try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const oldEmail = user.email;
    const newEmail = updates.email;

    // ✅ Update user
    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, { new: true });

    // ✅ If email changed, send notifications
    if (newEmail && oldEmail !== newEmail) {
      await sendEmailNotification(oldEmail, newEmail);
    }

    return res.json(sanitiseUser(updatedUser));
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({ message: "Profile update failed" });
  }
}


// ✅ Delete account
async function deleteMyProfile(req, res) {
  await User.findByIdAndDelete(req.user.id);
  res.json({ message: 'Account deleted' });
}

// ✅ Public profile by username
async function getPublicProfileByUsername(req, res) {
  const user = await User.findOne({ username: req.params.username }).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(publicUser(user));
}

// ✅ Public profile by ID
async function getPublicProfileById(req, res) {
  const user = await User.findById(req.params.id).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(publicUser(user));
}

// ✅ Allowed fields
function filterProfileFields(body) {
  const allowed = ['username', 'bio', 'phone', 'socialLinks', 'businessLinks', 'website'];
  const updates = {};
  for (const key of allowed) if (body[key] !== undefined) updates[key] = body[key];
  return updates;
}

// ✅ Send front profile
function sanitiseUser(user) {
  return {
    id: user._id,
    email: user.email,
    username: user.username,
    bio: user.bio,
    phone: user.phone,
    website: user.website,  // ✅ Added
    avatarUrl: user.avatarUrl,
    coverAvatar: user.coverAvatar,
    socialLinks: user.socialLinks,
    businessLinks: user.businessLinks,
  };
}

// ✅ Show public
function publicUser(user) {
  return {
    id: user._id,
    username: user.username,
    bio: user.bio,
    phone: user.phone,
    website: user.website, // ✅ Added
    avatarUrl: user.avatarUrl,
    coverAvatar: user.coverAvatar,
    socialLinks: user.socialLinks,
    businessLinks: user.businessLinks,
    qrCodeUrl: user.qrCodeUrl,
  };
}


//account seeting controller functions

async function getAccountSettings(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Account fetch error:", error);
    res.status(500).json({ message: "Failed to load account info" });
  }
}

/**
 * PUT /api/account/update
 * Update username, email, or password
 */
async function updateAccountSettings(req, res) {
  try {
    const { username, email, password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const oldEmail = user.email;
    let emailChanged = false;
    let passwordChanged = false;

    // ✅ Username update
    if (username && username !== user.username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: user._id },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      user.username = username;
    }

    // ✅ Email update
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({
        email,
        _id: { $ne: user._id },
      });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      emailChanged = true;
      user.email = email;
      // emailChanged = true;
    }

    // ✅ Password update
    if (password && password.trim() !== "") {
      const hashedPassword = await User.hashPassword(password);
      user.passwordHash = hashedPassword;
      passwordChanged = true;
    }

    await user.save();

    // ✅ Send notifications
    if (emailChanged) {
      await sendEmailNotification(oldEmail, user.email);
    }

    if (passwordChanged) {
      await sendpasswordNotification(user.email);
    }

    res.json({
      message: "Account updated successfully",
        emailChanged,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Account update error:", error);
    res.status(500).json({ message: "Failed to update account" });
  }
}


module.exports = {
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
  getPublicProfileByUsername,
  getPublicProfileById,
  updateAccountSettings,
  getAccountSettings,
};


