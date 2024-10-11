"use strict";


//custom error class creation
class CustomError extends Error{
    constructor(message,statusCode){
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = CustomError;