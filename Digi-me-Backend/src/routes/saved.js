const { Router } = require('express');
const { authRequired } = require('../middleware/auth');
const { listSaved, addSaved, removeSaved } = require('../controllers/savedController');

const router = Router();

router.get('/', authRequired, listSaved);
router.post('/', authRequired, addSaved);
router.delete('/', authRequired, removeSaved);

module.exports = router;


