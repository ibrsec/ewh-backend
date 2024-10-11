"use strict";

/* -------------------------------------------------------------------------- */
/*                               Email Model                               */
/* -------------------------------------------------------------------------- */

const {mongoose} = require('../configs/dbConnection');

const uniqueValidator = require("mongoose-unique-validator");
const emailValidation = require('../helpers/emailValidation');



const emailSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        // unique:true,
        trim:true, 
        maxlength:100,
        validate: [
          (email) => emailValidation(email),
          "Invalid email type, type: __@__.__",
        ],
    },
},{
    collection:'emails',timestamps:true,
})

emailSchema.plugin(uniqueValidator, {
    message: "This {PATH} is exist!(500)",
  });

  
module.exports.Email = mongoose.model('Email', emailSchema)