"use strict";

/* -------------------------------------------------------------------------- */
/*                               contactForm Model                               */
/* -------------------------------------------------------------------------- */

const {mongoose} = require('../configs/dbConnection');

// const uniqueValidator = require("mongoose-unique-validator");
const emailValidation = require('../helpers/emailValidation');



const contactInfoSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true, 
        trim:true, 
        maxlength:100, 
    },
    email:{
      type:String,
      required:true, 
      trim:true, 
      maxlength:100,
      validate: [
        (email) => emailValidation(email),
        "Invalid email type, type: __@__.__",
      ],
    },
    phone:{
        type:String,
        required:true, 
        trim:true, 
        maxlength:100, 
    },
    message:{
        type:String,
        required:true, 
        trim:true, 
        maxlength:1500, 
    },
    status:{
      type:String,
      enum:['new','read'],
      default:'new',  //default status is pending when contact form submitted.
    }
},{
    collection:'contactInfos',timestamps:true,
})



  
module.exports.ContactInfo = mongoose.model('ContactInfo', contactInfoSchema)