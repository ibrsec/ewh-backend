'use strict';


/* -------------------------------------------------------------------------- */
/*                               blog Router                              */
/* -------------------------------------------------------------------------- */
const router = require('express').Router();
const {blog} = require('../controllers/blogController');
const permissons = require('../middlewares/permissions');
const upload = require('../middlewares/upload');
/* -------------------------------------------------------------------------- */

router.route('/')
.get(  blog.list)
.post(permissons.isAdmin, upload.single('imageFile') ,blog.create);
router.route('/:id')
.get( blog.read)
.put(permissons.isAdmin, upload.single('imageFile') ,blog.update) 
.delete(permissons.isAdmin,blog.delete)
 

/* -------------------------------------------------------------------------- */
module.exports = router;

