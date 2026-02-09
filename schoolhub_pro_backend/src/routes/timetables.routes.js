const router = require('express').Router();
const controller = require('../controllers/timetables.controller');
const auth = require('../middleware/auth');
const { isAdmin, hasPermission } = require('../middleware/roleCheck');

router.get('/', auth, controller.getAll);
router.get('/:id', auth, controller.getById);
router.post('/', auth, isAdmin, controller.create);
router.put('/:id', auth, isAdmin, controller.update);
router.delete('/:id', auth, isAdmin, controller.delete);
router.delete('/class/:classId', auth, isAdmin, controller.deleteByClass);

module.exports = router;
