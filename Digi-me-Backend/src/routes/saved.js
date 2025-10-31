const { Router } = require('express');
const { authRequired } = require('../middleware/auth');
const { listSaved, addSaved, removeSaved,searchSavedProfiles } = require('../controllers/savedController');

const router = Router();

router.get('/', authRequired, listSaved);
router.post('/', authRequired, addSaved);
router.delete("/:id", authRequired, removeSaved);
router.get('/search', authRequired, searchSavedProfiles);

module.exports = router;


 