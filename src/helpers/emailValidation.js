"use strict";

const emailValidation = (email) => {
    return /.+@.+\..+/.test(email);
}

module.exports = emailValidation;