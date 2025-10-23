const { Router } = require('express');
const { connectionHealth } = require('../config/db');

const router = Router();

router.get('/health/db', (req, res) => {
  res.json({ db: connectionHealth() });
});

router.use('/auth', require('./auth'));
router.use('/profile', require('./profile'));
router.use('/qr', require('./qr'));
router.use('/saved', require('./saved'));

module.exports = router;


