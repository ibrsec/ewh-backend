"use strict";

/* -------------------------------------------------------------------------- */
/*                               Email Model                               */
/* -------------------------------------------------------------------------- */

const { mongoose } = require("../configs/dbConnection");

const uniqueValidator = require("mongoose-unique-validator");
const emailValidation = require("../helpers/emailValidation");
const { urlValidation } = require("../helpers/utils");

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      unique: true,
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
    //   public_id: { type: String, required: false },
    //   url: {
    //     type: String,
    //     required: false,
    //     validate: (url) => urlValidation(url),
    //   },
    // },

    order: {
      type: Number,
      required: true,
    },
    time: {
      type: String,
      trim: true,
      required: true,
      maxlength: 25,
    },
    points: [{ type: String, required: true, trim: true, maxLength:100 }],
  },
  {
    collection: "trainings",
    timestamps: true,
  }
);

trainingSchema.plugin(uniqueValidator, {
  message: "This {PATH} is exist!(500)",
});

module.exports.Training = mongoose.model("Training", trainingSchema);
