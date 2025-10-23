const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authRequired } = require('../middleware/auth');
const {
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
  getPublicProfileByUsername,
  getPublicProfileById,
  searchProfiles,
} = require('../controllers/profileController');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage });

const router = Router();

router.get('/me', authRequired, getMyProfile);
router.put('/me', authRequired, upload.single('avatar'), updateMyProfile);
router.delete('/me', authRequired, deleteMyProfile);

router.get('/public/username/:username', getPublicProfileByUsername);
router.get('/public/id/:id', getPublicProfileById);
router.get('/search', searchProfiles);

module.exports = router;


