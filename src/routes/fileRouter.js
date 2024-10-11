'use strict';


/* -------------------------------------------------------------------------- */
/*                               file Router                              */
/* -------------------------------------------------------------------------- */
const router = require('express').Router();
const {file} = require('../controllers/fileController.js');
const permissons = require('../middlewares/permissions');
const upload = require('../middlewares/upload');
/* -------------------------------------------------------------------------- */
 
router.route('/team/:teamId')
.get( file.getTeamFile)
 

/* -------------------------------------------------------------------------- */
module.exports = router;

