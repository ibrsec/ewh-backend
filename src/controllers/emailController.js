"use strict";

const CustomError = require("../errors/customError");
const emailValidation = require("../helpers/emailValidation");
const sanitizeContent = require("../helpers/sanitizeContent");
const sendMail = require("../helpers/sendMail");
const {
  idTypeValidationOr400,
  isExistOnTableOr404,
  mustRequirementOr400,
  lengthValidationOr400,
  isUniqueOnTableOr409,
  capitalize,
} = require("../helpers/utils");
// const { Category } = require("../models/categoryModel");
/* -------------------------------------------------------------------------- */
/*                             Email Controller                            */
/* -------------------------------------------------------------------------- */

const { Email } = require("../models/emailModel");

module.exports.email = {
  list: async (req, res) => {
    /*
            #swagger.tags = ["Emails"]
            #swagger.summary = "List Emails"
            #swagger.description = `
                List all Emails!</br></br>
                <b>Permission= Admin users</b></br>   
                You can send query with endpoint for filter[],search[], sort[], page and limit.
                <ul> Examples:
                    <li>URL/?<b>filter[field1]=value1&filter[field2]=value2</b></li>
                    <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
                    <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
                    <li>URL/?<b>page=2&limit=1</b></li>
                </ul>
            `

            #swagger.responses[200] = {
            description: 'Successfully Listed!',
                schema: { 
                    error: false,
                    message: "Emails are listed!",
                    data:{$ref: '#/definitions/Email'} 
                }
            }


        */
    const emails = await res.getModelList(Email);
    res.json({
      error: false,
      message: `Emails are listed!`,
      details: await res.getModelListDetails(Email),
      data: emails,
    });
  },
  read: async (req, res) => {
    /*
            #swagger.tags = ["Emails"]
            #swagger.summary = "Get a Email"
            #swagger.description = `
                Get a Email by email id(ObjectId)!</br></br>
                <b>Permission= Admin user</b></br>  
            `
            #swagger.responses[200] = {
            description: 'Successfully Found!',
                schema: { 
                    error: false,
                    message: "Email is found!",
                    data:{$ref: '#/definitions/Email'} 
                }
            }

            #swagger.responses[400] = {
            description:`Bad request - Invalid param Id type! (it Should be ObjectId)!`
            }

            #swagger.responses[404] = {
            description:`Not found - Email not found!`
            }

        */

    //id check if it is objectId
    idTypeValidationOr400(
      req.params.id,
      "Invalid param Id type! (it Should be ObjectId)"
    );
    // if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    //   throw new CustomError(
    //     "Invalid param Id type! (it Should be ObjectId)",
    //     400
    //   );
    // }

    const email = await isExistOnTableOr404(
      Email,
      { _id: req.params.id },
      "Email not found!"
    );
    // const email = await Email.findOne({ _id: req.params.id });

    // if (!email) {
    //   throw new CustomError("Email not found!", 404);
    // }

    res.json({
      error: false,
      message: `Email is found!`,
      data: email,
    });
  },

  create: async (req, res) => {
    /*
            #swagger.tags = ["Emails"]
            #swagger.summary = "Create Email"
            #swagger.description = `
                Create a Email!</br></br>
                <b>Permission= Admin user</b></br></br>
                - Email field max length: 100</br>  
                - Email name must be unique</br> 
            `

            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $email : 'test email name'
                }
            }
            #swagger.responses[201] = {
            description: 'Successfully created!',
            schema: { 
                error: false,
                message: "A new email is created!",
                data:{$ref: '#/definitions/Email'} 
            }

        }   


            #swagger.responses[400] = {
            description:`Bad request - email field is required!</br> 
                         - Invalid email length, max: 100!</br> 
                         - Invalid email type, Valid type: __@__.__</br> 
            
            `
            } 
            }
            #swagger.responses[409] = {
            description:`Conflict - This email is already exist!</br>
            
            `
            }


        */

    // * Checks if a requirement is mandatory based on the provided name in the request body.
    mustRequirementOr400({
      email: req.body.email,
    });
    // if (!req.body.name) {
    //   throw new CustomError("name field is required!", 400);
    // }

    const { email } = req.body;

    //length check
    lengthValidationOr400(email, "email", 1, 100);

    // email validation
    if (!emailValidation(email)) {
      throw new CustomError("Invalid email type, Valid type: __@__.__", 400);
    }

    //unique check

    await isUniqueOnTableOr409(
      Email,
      { email },
      "This email is already exist!"
    );

    delete req.body.createdAt;
    delete req.body.updatedAt;

    const newEmail = await Email.create(req.body); //create new email

    res.status(201).json({
      error: false,
      message: "A new email is created!",
      data: newEmail,
    });
  },
  update: async (req, res) => {
    /*
            #swagger.tags = ["Emails"]
            #swagger.summary = "UPDATE Email"
            #swagger.description = `
                Update a Email with id(ObjectId)!</br></br>
                <b>Permission= Admin user</b></br></br>
                - Email field max length: 100</br>  
                - Email field must be unique</br> 
            `

            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $email : 'test email name'
                }
            }
            #swagger.responses[202] = {
            description: 'Successfully updated!',
            schema: { 
                error: false,
                message: "Email is updated!",
                data:{$ref: '#/definitions/Email'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request: </br>
            - email field is required!</br>
            - Invalid param Id type! (it Should be ObjectId)!</br>  
            - Invalid email type, Valid type: __@__.__!</br>  
            
            `

            }
            #swagger.responses[404] = {
            description:`Not found: </br>
            - Email not found for update!</br>   
            
            `
            }
            #swagger.responses[409] = {
            description:`Conflict: </br>
            - This email is already exist!</br> 
            
            `
            }
            #swagger.responses[500] = {
            description:`Something went wrong! - Email is found! But it couldn't be updated!`
            }




        */

    //id type validation
    idTypeValidationOr400(
      req.params.id,
      "Invalid param Id type! (it Should be ObjectId)!"
    );

    mustRequirementOr400({
      email: req.body.email,
    });

    //desturuct name
    const { email } = req.body;

    //length check and error
    lengthValidationOr400(email, "email", 3, 100);

    // email validation
    if (!emailValidation(email)) {
      throw new CustomError("Invalid email type, Valid type: __@__.__", 400);
    }

    await isExistOnTableOr404(
      Email,
      { _id: req.params.id },
      "Email not found for update!"
    );

    //unique check
    await isUniqueOnTableOr409(
      Email,
      { email },
      "This email is already exist!"
    );

    delete req.body.createdAt;
    delete req.body.updatedAt;

    const { modifiedCount } = await Email.updateOne(
      { _id: req.params.id },
      req.body,
      { runValidators: true }
    );
    if (modifiedCount < 1) {
      throw new CustomError(
        "Something went wrong! - Email is found! But it couldn't be updated!",
        500
      );
    }

    res.status(202).json({
      error: false,
      message: "Email is updated!",
      data: await Email.findOne({ _id: req.params.id }),
    });
  },
  delete: async (req, res) => {
    /*
  #swagger.tags = ["Emails"]
  #swagger.summary = "Delete a Email"
  #swagger.description = `
      Delete a Email by email id(ObjectId)!</br></br>
      <b>Permission= Admin user</b></br>  
  `
  #swagger.responses[200] = {
  description: 'Successfully Deleted!',
      schema: { 
          error: false,
          message: "Email is deleted!",
          data:{$ref: '#/definitions/Email'} 
      }
  }

  #swagger.responses[400] = {
  description:`Bad request - Invalid param Id type! (it Should be ObjectId)!`
  }

  #swagger.responses[404] = {
  description:`Not found - Email not found for deletion!`
  }
  #swagger.responses[500] = {
  description:`Something went wrong! - Email is found! But it couldn't be deleted!`
  }

*/

    //id check
    idTypeValidationOr400(
      req.params.id,
      "Invalid param Id type! (it Should be ObjectId)"
    );

    await isExistOnTableOr404(
      Email,
      { _id: req.params.id },
      "Email not found for deletion!"
    );

    const { deletedCount } = await Email.deleteOne({ _id: req.params.id });
    if (deletedCount < 1) {
      throw new CustomError(
        "Something went wrong! - Email is found! But it couldn't be deleted!",
        500
      );
    }

    res.sendStatus(204);
  },
  subscribe: async (req, res) => {
    /*
            #swagger.ignore = true

        */

    // * Checks if a requirement is mandatory based on the provided name in the request body.
    mustRequirementOr400({
      email: req.body.email,
    });

    const { email } = req.body;

    //length check
    lengthValidationOr400(email, "email", 1, 100);

    //unique check
    await isUniqueOnTableOr409(
      Email,
      { email },
      "Bu email adresi zaten bültenimize kayıtlı. Teşekkür ederiz!"
    );

    delete req.body.createdAt;
    delete req.body.updatedAt;

    const newEmail = await Email.create(req.body); //create new email

    sendMail(
      newEmail?.email,
      "English with Hatice - Hoşgeldiniz!",
      `
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); overflow: hidden;">
      <div style="background-color: #2d1f55; color: #ffffff; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Email Bultenimize hoşgeldiniz!</h1>
      </div>
      <div style="padding: 30px; text-align: center;">
          <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0;">Merhaba,</p>
          <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0;">Hoş Geldiniz! Bültenimize katıldığınız için çok heyecanlıyız. 🎉
          </p>
          <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0;">En son haberlerimizden ilk siz haberdar olacaksınız! Özel içeriklere ve heyecan verici gelişmelere herkesten önce ulaşmanın ayrıcalığını yaşayın!</p>
          <a href="${process.env.WEBSITE}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #2d1f55; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Sitemizi ziyaret edin</a>
      </div>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #777777;">
          <p style="margin: 0;">Herhangi bir sorunuz veya geri bildiriminiz varsa, bizimle iletişime geçmekten çekinmeyin. Sizin görüşleriniz bizim için çok değerli!</p>
          <p style="margin: 0;">Aboneliğinizi iptal etmek isterseniz:</p>
          <a href="${process.env.WEBSITE}/api/emails/subscription/${newEmail?._id}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #2d1f55; 
          color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;"> Üyeliği Sonlandır</a>
          <p style="margin: 0;">Abone olduğunuz için teşekkür ederiz!</p>
          <p style="margin: 0;">Saygılarımızla,<br>English with Hatice</p>
      </div>
  </div>
      `
    );

    res.status(201).json({
      error: false,
      message: `Kaydınız tamamlandı! Mail bültenimize hoş geldiniz - Lütfen mail kutunuzu kontrol ediniz!`,
      data: newEmail,
    });
  },
  deleteSubscribe: async (req, res) => {
    /*
  #swagger.ignore = true

*/

    //id check
    idTypeValidationOr400(
      req.params.id,
      "Invalid param Id type! (it Should be ObjectId)"
    );
    // if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    //   throw new CustomError(
    //     "Invalid param Id type! (it Should be ObjectId)",
    //     400
    //   );
    // }

    const email = await isExistOnTableOr404(
      Email,
      { _id: req.params.id },
      "Email not found for deletion!"
    );
    // const email = await Email.findOne({ _id: req.params.id });

    // if (!email) {
    //   throw new CustomError("Email not found for deletion!", 404);
    // }

    const { deletedCount } = await Email.deleteOne({ _id: req.params.id });
    if (deletedCount < 1) {
      throw new CustomError(
        "Something went wrong! - Email is found! But it couldn't be deleted!",
        500
      );
    }

    sendMail(
      email?.email,
      "English with Hatice - Hoşgeldiniz!",
      `
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); overflow: hidden;">
      <div style="background-color: #2d1f55; color: #ffffff; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Hoşçakalın!</h1>
      </div>
      <div style="padding: 30px; text-align: center;">
      <p style="padding: 30px; text-align: center; color:purple; font-weight:500; font-size:24px;">Aboneliğiniz başarıyla kaldırılmıştır! Teşekkür ederiz, en iyi dileklerimizle!      </p>
      </div>
  </div>
      `
    );

    res.send(`
      <p style="padding: 30px; text-align: center; color:purple; font-weight:500; font-size:24px;">Aboneliğiniz başarıyla kaldırılmıştır! Teşekkür ederiz, en iyi dileklerimizle!      </p>
    `);
  },

  sendAllMail: async (req, res) => {
    /*
            #swagger.ignore = true

        */

    // * Checks if a requirement is mandatory based on the provided name in the request body.
    mustRequirementOr400({
      content: req.body.content,
    });

    // Kullanıcının gönderdiği içeriği temizleme
    const cleanSantizeContent = sanitizeContent(req.body.content);

    req.body.content = cleanSantizeContent.trim();

    const allEmailsData = await Email.find();

    sendMail(
      allEmailsData.map((email) => email.email).join(","),
      "English with Hatice!",
      `
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); overflow: hidden;">
      <div style="background-color: #2d1f55; color: #ffffff; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">English with Hatice</h1>
      </div>
      <div style="padding: 30px;">
      
      ${req.body.content}
      </div>
      <div className="">
        <div style="padding: 30px; text-align: center;">  
            <a href="${process.env.WEBSITE}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #2d1f55; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Sitemizi ziyaret edin</a>
        </div>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #777777;">
            <p style="margin: 0;">Herhangi bir sorunuz veya geri bildiriminiz varsa, bizimle iletişime geçmekten çekinmeyin. Sizin görüşleriniz bizim için çok değerli!</p>
            <p style="margin: 0;">Aboneliğinizi iptal etmek için bizimle iletişime geçebilirsiniz:</p>
            <a href="${process.env.WEBSITE}/contact" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #2d1f55; 
            color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;"> İletişim</a> 
            <p style="margin: 0; margin-top: 10px; font-size:30px;">English with Hatice</p>
        </div>
      </div>
      
  </div>
      `
    );

    res.status(200).json({
      error: false,
      message: `Mailiniz Email Listesindeki herkese gönderildi!`,
    });
  },
};
