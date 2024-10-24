"use strict";

const CustomError = require("../errors/customError");
const { ContactInfo } = require("../models/contactInfoModel");
const {
  mustRequirementOr400,
  idTypeValidationOr400,
  isExistOnTableOr404,
  lengthValidationOr400,
} = require("../helpers/utils");
const emailValidation = require("../helpers/emailValidation");
const sendMail = require("../helpers/sendMail");

module.exports.contactInfo = {
  list: async function (req, res) {
    /*
            #swagger.tags = ["ContactInfo"]
            #swagger.summary = "List ContactInfos"
            #swagger.description = `
                List all contactInfos!</br></br>
                <b>Permission= Admin User</b></br>   </br> 
                You can send query with endpoint for filter[],search[], sort[], page and limit.
                <ul> Examples:
                    <li>URL/?<b>filter[field1]=value1&filter[field2]=value2</b></li>
                    <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
                    <li>URL/?<b>sort[field1]=asc&sort[field2]=desc</b></li>
                    <li>URL/?<b>page=2&limit=1</b></li>
                </ul>
            `
            #swagger.parameters['filter[]'] = {
                    in: 'query',       
                    description: 'url?filter[fieldName]=value'                        
            }
            #swagger.parameters['search[]'] = {
                    in: 'query',    
                    description: 'url?search[fieldName]=value'                      
            }
            #swagger.parameters['sort[]'] = {
                    in: 'query',
                    description: 'url?sort[fieldName]=desc(or asc)'                          
            }
            #swagger.parameters['page'] = {
                    in: 'query',              
                    description: 'url?page=1'               
            }
            #swagger.parameters['limit'] = {
                    in: 'query',     
                    description: 'url?limit=20'                        
            }

            #swagger.responses[200] = {
              description: 'Successfully Listed!',
              schema: { 
                  error: false,
                  message: "ContactInfos are listed!",
                  data:{$ref: '#/definitions/ContactInfo'} 
              }
            }

            
    


        */

    // const isAdmin = req.user?.isAdmin;
    // let choosedFilter = { email: 0 };
    // if (req.user?.isAdmin) {
    //   choosedFilter = {};
    // }

    const contactInfos = await res.getModelList(ContactInfo);
    // const contactInfos = await ContactInfo.find();

    contactInfos.sort((a, b) => {
      // Önce status değerlerini karşılaştır
      if (a.status < b.status) return -1; // 'a' önce gelsin
      if (a.status > b.status) return 1;  // 'b' önce gelsin
  
      // Eğer status değerleri eşitse, createdAt'ı karşılaştır
      return new Date(b.createdAt) - new Date(a.createdAt); // En yeni tarih önce gelsin
  });
  
  // Sonuç
  // console.log(contactInfos);



    res.status(200).json({
      error: false,
      message: "ContactInfos are listed!",
      details: await res.getModelListDetails(ContactInfo),
      data: contactInfos,
    });
  },
  create: async (req, res) => {
    /*
            #swagger.tags = ["ContactInfo"]
            #swagger.summary = "Create new ContactInfo"
            #swagger.description = `
                Create a new contactInfo!</br></br>
                <b>Permission= No Permisson</b></br></br> 
                - fullName length max:100</br>
                - phone length max:100</br>  
                - message field  max length: 1500</br>  
                - email length max:100</br>   
                - email type: email@example.com</br>
                
                - Required fields: - fullName, phone, message, email</br>  

            `

 
            #swagger.consumes = ['application/json']    
   


            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $fullName : 'name surname', 
                    $phone : '2387487234',
                    $email : "example@example.com",  ,
                    $message : 'message',  

                }
            }
            #swagger.responses[201] = {
            description: 'Successfully created!',
            schema: { 
                error: false,
                message: "Mesajiniz gonderildi!",
                data:{$ref: '#/definitions/ContactInfo'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request </br>
                - fullName, phone, message, email fields are required!</br>  
                - Length errors</br>
                `
            } 



        */

    const { fullName, phone, message, email } = req.body;

    //check if the payload is sended correctly by contactInfo
    mustRequirementOr400({
      fullName,
      phone,
      message,
      email,
    });

    lengthValidationOr400(fullName, "fullName", 1, 100);
    lengthValidationOr400(phone, "phone", 1, 100);
    lengthValidationOr400(email, "email", 1, 100);
    lengthValidationOr400(message, "message", 1, 1500);

    if (!emailValidation(email)) {
      throw new CustomError(
        "Lütfen geçerli bir email adresi girin! - example@email.com",
        400
      );
    }

    // deleting dates from request body
    delete req.body.createdAt;
    delete req.body.updatedAt;
    delete req.body.status;

    //create contactInfo
    const newContactInfo = await ContactInfo.create(req.body);

    res.status(201).json({
      error: false,
      message: "Mesajınız gönderildi, teşekkürler!",
      data: newContactInfo,
    });

    sendMail(
      newContactInfo?.email,
      "English with Hatice",
      `
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); overflow: hidden;">
      <div style="background-color: #2d1f55; color: #ffffff; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">English With Hatice</h1>
      </div>
      <div style="padding: 30px;  ">
          <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0;">Formunuz başarıyla gönderildi!</p>
          <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0;">Ad soyad: ${newContactInfo?.fullName}</p> 
          <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0;">Email: ${newContactInfo?.email}</p> 
          <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0;">Telefon: ${newContactInfo?.phone}</p> 
          <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0;">Mesajiniz: ${newContactInfo?.message}</p> 
          </div>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #777777;">
          <a href="${process.env.WEBSITE}" style="display: inline-block; margin-top: 20px; margin-bottom: 20px; padding: 10px 20px; background-color: #2d1f55; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Sitemizi ziyaret edin</a>
          <p style="margin: 0;">Herhangi bir sorunuz veya geri bildiriminiz varsa, bizimle iletişime geçmekten çekinmeyin. Sizin görüşleriniz bizim için çok değerli!</p>
          <p style="margin: 0; font-size:24px;">English with Hatice</p>
      </div>
  </div>
      `
    );

    // } catch (error) {
    //   // Eğer bir hata olursa yüklenen resmi Cloudinary'den sil
    //   if (file) {
    //     if (resultImage) {
    //       await cloudinary.uploader.destroy(resultImage.public_id);
    //     }
    //   }
    //   throw new CustomError(error.message, error.statusCode);
    // }
  },

  // read: async (req, res) => {
  //   /*
  //           #swagger.tags = ["ContactInfo"]
  //           #swagger.summary = "Get a contactInfo"
  //           #swagger.description = `
  //               Get a contactInfo by id!!</br></br>
  //               <b>Permission= No Permission</b></br>
  //               </br>
  //               `

  //           #swagger.responses[200] = {
  //           description: 'Successfully found!',
  //           schema: {
  //               error: false,
  //               message: "ContactInfo is found!",
  //               data:{$ref: '#/definitions/ContactInfo'}
  //           }

  //       }
  //           #swagger.responses[400] = {
  //           description:`Bad request - Invalid contactInfoId (paramId) type(ObjectId)!`
  //           }
  //           #swagger.responses[404] = {
  //           description:`Not found - ContactInfo not found!`
  //           }

  //       */

  //   //check if the sended id is a valid mongoose object id
  //   idTypeValidationOr400(
  //     req.params.id,
  //     "Invalid contactInfoId (paramId) type(ObjectId)!"
  //   );
  //   // const isAdmin = req.user?.isAdmin;

  //   //search the contactInfo on contactInfo collection
  //   const contactInfo = await isExistOnTableOr404(
  //     ContactInfo,
  //     { _id: req.params.id },
  //     "ContactInfo not found!"
  //   );

  //   //admin user read restriction(email and userId)
  //   // if (!req.user?.isAdmin) {
  //   //   delete contactInfo?.email;
  //   //   delete contactInfo?.userId;
  //   // }

  //   res.status(200).json({
  //     error: false,
  //     message: "ContactInfo is found!",
  //     data: contactInfo,
  //   });
  // },

  // update: async (req, res) => {
  //   /*
  //           #swagger.tags = ["ContactInfo"]
  //           #swagger.summary = "Update a ContactInfo"
  //           #swagger.description = `
  //               Update a ContactInfo by id!</br></br>
  //               <b>Permission= Admin user</b></br>
  //               - title length max:40</br>
  //               - description length max:300</br>
  //               - order field is number, 1,2,3,4 -> for manual order, user can select the order</br>
  //               - time field string, max length: 25</br>
  //               - points -> array of string, each string maxlength: 100</br>
  //               - Required fields: - title, description, order, time, points </br>

  //           `

  //           #swagger.consumes = ['application/json']

  //           #swagger.parameters['body']={
  //               in:'body',
  //               required:true,
  //               schema:{
  //                   $title : 'test contactInfo',
  //                   $description : 'desc',
  //                   $order : 1  ,
  //                   $time : '48 saat',
  //                   $points : ["point 1", "point-2"]

  //               }
  //           }
  //           #swagger.responses[202] = {
  //           description: 'Successfully updated!',
  //           schema: {
  //               error: false,
  //               message: "ContactInfo is updated!!",
  //               data:{modifiedCount:1},
  //               new:{$ref: '#/definitions/ContactInfo'}
  //           }

  //       }

  //           #swagger.responses[400] = {
  //               description:`Bad request
  //                   </br>- Invalid contactInfoId(paramId) type(ObjectId)!
  //               - title, description, order, time, points fields are required!</br>
  //               - Length errors</br>
  //                   `
  //           }
  //           #swagger.responses[404] = {
  //               description:`Not found </br>
  //               - ContactInfo not found for update!</br>
  //               `
  //           }
  //           #swagger.responses[500] = {
  //               description:`Something went wrong! - asked record is found, but it couldn't be updated!`
  //           }

  //       */

  //   //check if the sended id is a valid mongoose object id
  //   idTypeValidationOr400(
  //     req.params.id,
  //     "Invalid contactInfoId(paramId) type(ObjectId)!"
  //   );

  //   //destruct the req body fields
  //   const { title, description, order, time, points } = req.body;

  //   //check if the payload is sended correctly by contactInfo
  //   mustRequirementOr400({
  //     title,
  //     description,
  //     order,
  //     time,
  //     points,
  //   });

  //   lengthValidationOr400(title, "title", 1, 40);
  //   lengthValidationOr400(description, "description", 1, 300);
  //   lengthValidationOr400(time, "time", 1, 25);

  //   //search the contactInfo on contactInfo collection
  //   const contactInfo = await isExistOnTableOr404(
  //     ContactInfo,
  //     { _id: req.params.id },
  //     "ContactInfo not found for update!"
  //   );

  //   //delete date signatures form payload
  //   delete req.body.createdAt;
  //   delete req.body.updatedAt;
  //   // delete req.body.image;

  //   // const file = req.file;

  //   // let resultImage;

  //   // if (file) {
  //   //   console.log("file", file);

  //   //   resultImage = await cloudinary.uploader.upload(file.path, {
  //   //     folder: "contactInfo",
  //   //     // width: 300,
  //   //     // crop: "scale"
  //   //   });
  //   //   req.body.image = {
  //   //     public_id: resultImage?.public_id,
  //   //     url: resultImage?.secure_url,
  //   //   };
  //   // }

  //   //update the contactInfo with new data
  //   const data = await ContactInfo.updateOne({ _id: req.params.id }, req.body, {
  //     runValidators: true,
  //   });

  //   //check if the contactInfo updated or not
  //   if (data?.modifiedCount < 1) {
  //     // updating failed

  //     // delete the uploaded image from cloudinary if it failed to update
  //     // if (resultImage) {
  //     //   await cloudinary.uploader.destroy(resultImage.public_id);
  //     // }

  //     throw new CustomError(
  //       "Something went wrong! - asked record is found, but it couldn't be updated!",
  //       500
  //     );
  //   }

  //   //updated successfully
  //   //delete the old image from cloudinary if it successed to update
  //   // await cloudinary.uploader
  //   //   .destroy(contactInfo?.image?.public_id)
  //   //   .then(() =>
  //   //     console.log(contactInfo?.image?.public_id + " is deleted from cloudinary!")
  //   //   );

  //   //return the updated contactInfo with new data
  //   res.status(202).json({
  //     error: false,
  //     message: "ContactInfo member is updated!",
  //     data,
  //     new: await ContactInfo.findOne({ _id: req.params.id }),
  //   });
  // },

  statusOkundu: async (req, res) => {
    /*
              #swagger.tags = ["ContactInfos"]
              #swagger.summary = "Change status with 'okundu'"
              #swagger.description = `
                  Change status with 'okundu' a ContactInfo by id!</br></br>
                  <b>Permission= Admin user</b></br>
   `

              #swagger.responses[202] = {
              description: 'Successfully partially updated!',
              schema: {
                  error: false,
                  message: "ContactInfo is partially updated!!",
                  data:{modifiedCount:1},
                  new:{$ref: '#/definitions/ContactInfo'}
              }

          }

              #swagger.responses[400] = {
                  description:`Bad request
                      </br>- Invalid contactInfoId(paramId) type(ObjectId)! 
                      `
              }
              #swagger.responses[404] = {
                  description:`Not found - ContactInfo not found for partial update!`
              }
              #swagger.responses[500] = {
                  description:`Something went wrong! - asked record is found, but it couldn't be updated!`
              }

          */

    //check if the sended id is a valid mongoose object id
    idTypeValidationOr400(
      req.params.id,
      "Invalid contactInfoId(paramId) type(ObjectId)!"
    );

    //search contactInfo
    const contactInfo = await isExistOnTableOr404(
      ContactInfo,
      { _id: req.params.id },
      "ContactInfo not found for partial update!"
    );

    //update the contactInfo with new data
    const { modifiedCount } = await ContactInfo.updateOne(
      { _id: req.params.id },
      { status: "read" },
      { runValidators: true }
    );

    //check if the contactInfo updated or not
    if (modifiedCount < 1) {
      throw new CustomError(
        "Something went wrong! - asked record is found, but it couldn't be updated!",
        500
      );
    }

    //return the updated contactInfo with new data
    res.status(202).json({
      error: false,
      message: "Contact form is read!",
      result: await ContactInfo.findOne({ _id: req.params.id }),
    });
  },

  delete: async (req, res) => {
    /*
            #swagger.tags = ["ContactInfo"]
            #swagger.summary = "Delete a contactInfo"
            #swagger.description = `
                Delete a contactInfo by id!!</br></br>
                <b>Permission= Admin user</b></br>  
                ` 
            
            #swagger.responses[204] = {
            description: 'Successfully deleted!'

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid contactInfoId(paramId) type(ObjectId)!`
            }
            #swagger.responses[404] = {
            description:`Not found - ContactInfo not found for delete!`
            }

            #swagger.responses[500] = {
                description:`Something went wrong! - asked record is found, but it couldn't be updated!`
            }

        */

    // check if the sended id is a valid mongoose object id
    idTypeValidationOr400(
      req.params.id,
      "Invalid contactInfoId(paramId) type(ObjectId)!"
    );

    // find the contactInfo by id
    const contactInfo = await isExistOnTableOr404(
      ContactInfo,
      { _id: req.params.id },
      "ContactInfo could not be found for deletion!"
    );

    //delete contactInfo
    const { deletedCount } = await ContactInfo.deleteOne({
      _id: req.params.id,
    });
    //check if the contactInfo is deleted
    if (deletedCount < 1) {
      throw new CustomError(
        "Something went wrong! - asked record is found, but it couldn't be deleted!",
        500
      );
    }

    //delete old image
    // await cloudinary.uploader
    //   .destroy(contactInfo?.image?.public_id)
    //   .then(() =>
    //     console.log(contactInfo?.image?.public_id + " is deleted from cloudinary!")
    //   );

    //the result
    res.sendStatus(204);
  },
};
