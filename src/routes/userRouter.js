"use strict";


const router = require("express").Router();
const { user } = require("../controllers/userController");
const permissions = require('../middlewares/permissions');
 

/* ------------------------------------ k ----------------------------------- */

router
    .route("/")
        .get(permissions.isLogin, user.list)
        .post(   user.create);

router
  .route("/:id")
    .get(permissions.isLogin, user.read)
    .put(permissions.isLogin,   user.update)
    .patch(permissions.isLogin,   user.partialUpdate)
    .delete(permissions.isAdmin, user.delete);

/* ------------------------------------ k ----------------------------------- */
module.exports = router;
