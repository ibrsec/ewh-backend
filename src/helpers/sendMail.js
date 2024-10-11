"use strict"
/* -------------------------------------------------------
    | Send email |
------------------------------------------------------- */
// sendMail(to, subject, message)

const nodemailer = require('nodemailer')

module.exports = function sendMail(to, subject, message) {



// Mailjet ile Nodemailer konfigürasyonu
const transporter = nodemailer.createTransport({
    host: 'in-v3.mailjet.com',
    port: 587,
    auth: {
      user: process.env.MAILJET_USER,  // Mailjet username (API Anahtarı 1) api key
      pass: process.env.MAILJET_API_KEY // Mailjet key (API Anahtarı 2) api secret
    }
  });








    // SendMail:
    transporter.sendMail({

        from: 'crimsongart@gmail.com',
        // to: 'ibr.seckin@gmail.com', // 'abc@def.com, def@ghi.com'
        to: to,
        // subject: 'Hello',
        subject: subject,
        // text: 'Hello There. How are you?',
        text: message,
        // html: '<p> <b> Hello There </b> <br> How are you? </p>',
        html: message,

    }, function (error, success) {

        success ? console.log('SUCCESS:', success) : console.log('ERROR: ', error)
    })

}



