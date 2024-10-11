'use strict';


/* -------------------------------------------------------------------------- */
/*                               training Router                              */
/* -------------------------------------------------------------------------- */
const router = require('express').Router();
const {training} = require('../controllers/trainingController');
const permissons = require('../middlewares/permissions');
const upload = require('../middlewares/upload');
/* -------------------------------------------------------------------------- */

router.route('/')
.get(  training.list)
.post(permissons.isAdmin, upload.single('imageFile') ,training.create);
router.route('/:id')
.get( training.read)
.put(permissons.isAdmin, upload.single('imageFile') ,training.update) 
.delete(permissons.isAdmin,training.delete)
 

/* -------------------------------------------------------------------------- */
module.exports = router;

