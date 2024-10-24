'use strict';


/* -------------------------------------------------------------------------- */
/*                               contactInfo Router                              */
/* -------------------------------------------------------------------------- */
const router = require('express').Router();
const {contactInfo} = require('../controllers/contactInfoController');
const permissons = require('../middlewares/permissions'); 
/* -------------------------------------------------------------------------- */

router.route('/')
.get( permissons.isAdmin, contactInfo.list)
.post(  contactInfo.create);
router.route('/:id')  
.delete(permissons.isAdmin, contactInfo.delete)
router.route('/read/:id') 
.put(permissons.isAdmin, contactInfo.statusOkundu) 
 

/* -------------------------------------------------------------------------- */
module.exports = router;

