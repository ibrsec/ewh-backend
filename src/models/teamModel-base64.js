"use strict";

/* -------------------------------------------------------------------------- */
/*                               Email Model                               */
/* -------------------------------------------------------------------------- */

const { mongoose } = require("../configs/dbConnection");

const uniqueValidator = require("mongoose-unique-validator");
const emailValidation = require("../helpers/emailValidation");
const { urlValidation } = require("../helpers/utils");

const teamSchema = new mongoose.Schema(
  {
    // userId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User", 
    //   unique: true, 
    // },
    fullName: {
      type: String,
      trim: true,
      unique:true,
      required: true,
      maxlength: 40,
    },
    description: {
      type: String,
      trim: true,
      required: true,
      maxlength: 300,
    },
    // image: {
    //   type: String,
    //   trim: true,
    //   required: true,
    //   validate: [
    //     (image) => urlValidation(image),
    //     "Invalid image url type - must start with `http://` or `https://` !",
    //   ],
    //   maxlength: 500,
    // },
    image: {
      size: { type: Number, required: true },
      mimeType: { type: String, required: true },
      fileName: { type: String, required: true },
      buffer: { type: Buffer, required: true }, // Buffer olarak tanımlayın
      // url: { type: String, required: false } // Buffer olarak tanımlayın
  }, 
    email: {
      type: String,
      required: true,
      // unique:true,
      trim: true,
      unique:true,
      maxlength: 100,
      validate: [
        (email) => emailValidation(email),
        "Invalid email type, type: __@__.__",
      ],
    },
  },
  {
    collection: "team-members",
    timestamps: true,
  }
);

teamSchema.plugin(uniqueValidator, {
  message: "This {PATH} is exist!(500)",
});

module.exports.Team = mongoose.model("Team", teamSchema);
