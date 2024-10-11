"use strict"

const CustomError = require("../errors/customError")

    /* -------------------------------------------------------------------------- */
    /*                                 PERMISSIONS                                */
    /* -------------------------------------------------------------------------- */


module.exports = {

    //loginned user permissions
    isLogin : (req,res,next)=> {
        if(!req?.user ){
            throw new CustomError('Forbidden - You must login first!',401)
        } 
        
        next()

        
    },
    //admin user permissions 
    isAdmin: (req,res,next)=> {
        if(!req.user?.isAdmin){
            throw new CustomError('Forbidden - You must login as admin user!', 403)
        }
         
        next();

        
    },
}