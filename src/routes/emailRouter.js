'use strict';


/* -------------------------------------------------------------------------- */
/*                               email Router                              */
/* -------------------------------------------------------------------------- */
const router = require('express').Router();
const {email} = require('../controllers/emailController');
const permissons = require('../middlewares/permissions');
/* -------------------------------------------------------------------------- */

router.route('/')
.get(permissons.isAdmin, email.list)
.post(permissons.isAdmin,email.create);
router.route('/:id')
.get(permissons.isAdmin,email.read)
.put(permissons.isAdmin,email.update) 
.delete(permissons.isAdmin,email.delete)

router.post('/subscription',email.subscribe);
router.get('/subscription/:id',email.deleteSubscribe);

/* -------------------------------------------------------------------------- */
module.exports = router;

