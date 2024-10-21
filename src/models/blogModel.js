"use strict";

/* -------------------------------------------------------------------------- */
/*                               Blog Model                               */
/* -------------------------------------------------------------------------- */

const { mongoose } = require("../configs/dbConnection");

// const uniqueValidator = require("mongoose-unique-validator");
// const emailValidation = require("../helpers/emailValidation");
const { urlValidation } = require("../helpers/utils");


const blogSchema = new mongoose.Schema(
  { 
    title: {
      type: String,
      trim: true, 
      required: true,
      maxlength: 150,
    },
    author: {
      type: String,
      trim: true,
      required: true,
      maxlength: 100,
    }, 
    image: { 
      public_id: { type: String, required: true },
      url: { type: String, required: true, validate: (url) => urlValidation(url) }, 
    }, 
    order: {
      type: Number,
      required: true,
    },
    content:{
      type:String,
      trim:true,
      required: true
    },
    shortDescription:{
      type:String,
      trim:true,
      required: true,
      maxlength:350,
    }
  },
  {
    collection: "blogs",
    timestamps: true,
  }
);
 

module.exports.Blog = mongoose.model("Blog", blogSchema);
