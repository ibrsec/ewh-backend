"use strict";

const { mongoose } = require("../configs/dbConnection");
const CustomError = require("../errors/customError");








module.exports.idTypeValidationOr400 = (idField,message) => {
    if (!mongoose.Types.ObjectId.isValid(idField)) {
        throw new CustomError(message, 400);
      } 
}





 
module.exports.isExistOnTableOr404 = async(Model, filter, message) => {

    const result = await Model.findOne(filter)
    if(!result){
      throw new CustomError(message, 404);
    } 

    return result;
}



module.exports.isUniqueOnTableOr409 = async(Model, filter, message) => {

    const result = await Model.findOne(filter)
    if(result){
      throw new CustomError(message, 409);
    } 

    return result;
}


 
module.exports.lengthValidationOr400 = (field, fieldName, start, end) => { 

    if(field.length < start || field.length > end){
      throw new CustomError(
        start === end ? `${fieldName} length should be ${end}!` : `${fieldName} length should be between ${start} to ${end}!`,
        400
      );
    }
  };
   




  
  module.exports.mustRequirementOr400 = (fields) => { 
    const emptyFields = [];


    for (const [name, value] of Object.entries(fields)) {
        if (value == null) {
          emptyFields.push(name);
        }
      }
    
    if(emptyFields.length > 0){
        throw new CustomError(
            "Some required fields are missing or empty: "+ emptyFields.join(", "),
            400
          );
    }

  };
  


  module.exports.partialRequirementOr400 = (fields) => { 
    const emptyFields = [];
    for (const [name, value] of Object.entries(fields)) {
        if (value == null) {
          emptyFields.push(name);
        }
      }

    if(emptyFields.length === Object.keys(fields).length){
        throw new CustomError(
            "At Least 1(one) field is required: "+emptyFields.join(", "),
            400
          );
    }


  };
  





  module.exports.capitalize = (field) => { 

    return field.trim()[0].toUpperCase() + field.trim().slice(1)
  };
  

  /**
 * Validates a URL using a regular expression.
 * @param {string} url - The URL to validate.
 * @returns {boolean} - True if the URL is valid, false otherwise.
 */
module.exports.urlValidation = (url) => {
    // Regex to check if the URL starts with http:// or https:// (case-sensitive)
    const regex = /^https?:\/\//;
    return regex.test(url);

}
