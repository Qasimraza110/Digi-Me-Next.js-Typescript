const { Router } = require('express');
const { authRequired } = require('../middleware/auth');
const { generateMyQr, scanQR } = require('../controllers/qrController');

const router = Router();

router.get('/me', authRequired, generateMyQr);
router.post('/scan', scanQR);

module.exports = router;


