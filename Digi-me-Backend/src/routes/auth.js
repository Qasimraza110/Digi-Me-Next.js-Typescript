const { Router } = require('express');
const { register, login, requestPasswordReset, resetPassword, googleLogin } = require('../controllers/authController');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/password/forgot', requestPasswordReset);
router.post('/password/reset', resetPassword);
router.post('/google', googleLogin);

module.exports = router;


