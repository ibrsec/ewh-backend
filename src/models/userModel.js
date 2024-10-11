"use strict";

const { mongoose } = require("../configs/dbConnection"); 
const passwordEncryptor = require("../helpers/passwordEncryptor");
const passwordValidation = require("../helpers/passwordValidation");
const emailValidation = require("../helpers/emailValidation");
const uniqueValidator = require("mongoose-unique-validator");



const invalidPasswordMessage =
  "Invalid password type Rules- [lenght:8-16, at least: 1 upper, 1 lower, 1 number, 1 special[@$!%*?&]]";



const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    index:true,
    maxlength: 40,
  },
  password: {
    type: String,
    trim: true,
    required: true,
    set: (password) => {
      if (passwordValidation(password)) {
        
        return passwordEncryptor(password);
      } else {
        return invalidPasswordMessage;
      }
    },
    validate: [
      (password) => {
        if (password === invalidPasswordMessage) {
          
          return false;
        } else {
          return true;
        }
      },
      invalidPasswordMessage,
    ],
  },
  fullName:{
    type:String,
    trim:true,
    required: true,
    maxlength: 40,
    
  },email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    index:true,
    validate: [
      (email) => emailValidation(email),
      "Invalid email type, type: __@__.__",
    ],
    maxlength: 100,
  },
  // gender:{
  //   type:String,
  //   trim:true,
  //   required: true,
  //   enum:['male','female']

  // },
  // image:{
  //   type:String,
  //   trim:true,
  //   required: true,
  // },
  isAdmin:{
    type: Boolean,
    default:false,

  },
},{
    collection:'users',timestamps:true
});

UserSchema.plugin(uniqueValidator, {
  message: "This {PATH} is exist!",
});


module.exports.User = mongoose.model('User',UserSchema);