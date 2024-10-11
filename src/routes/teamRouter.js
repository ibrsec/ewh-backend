'use strict';


/* -------------------------------------------------------------------------- */
/*                               team Router                              */
/* -------------------------------------------------------------------------- */
const router = require('express').Router();
const {team} = require('../controllers/teamController');
const permissons = require('../middlewares/permissions');
const upload = require('../middlewares/upload');
/* -------------------------------------------------------------------------- */

router.route('/')
.get(  team.list)
.post(permissons.isAdmin, upload.single('imageFile') ,team.create);
router.route('/:id')
.get( team.read)
.put(permissons.isAdmin, upload.single('imageFile') ,team.update) 
.delete(permissons.isAdmin,team.delete)
 

/* -------------------------------------------------------------------------- */
module.exports = router;

