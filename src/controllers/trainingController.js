"use strict";

const { mongoose } = require("../configs/dbConnection");
const CustomError = require("../errors/customError");
const { Training } = require("../models/trainingModel");
const {
  mustRequirementOr400,
  idTypeValidationOr400,
  isExistOnTableOr404,
  partialRequirementOr400,
  lengthValidationOr400,
} = require("../helpers/utils");
const { User } = require("../models/userModel");
const {
  uploadFileToGoogleDrive,
  deleteFile,
} = require("../helpers/googleDriveUpload");
const bufferToBase64 = require("../helpers/bufferToBase64");
const cloudinary = require("../helpers/cloudinary");

module.exports.training = {
  list: async function (req, res) {
    /*
            #swagger.tags = ["Training"]
            #swagger.summary = "List Trainings"
            #swagger.description = `
                List all trainings!</br></br>
                <b>Permission= No Permission</b></br>   </br> 
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
                  message: "Trainings are listed!",
                  data:{$ref: '#/definitions/Training'} 
              }
            }

            
    


        */

    // const isAdmin = req.user?.isAdmin;
    // let choosedFilter = { email: 0 };
    // if (req.user?.isAdmin) {
    //   choosedFilter = {};
    // }

    // const trainings = await res.getModelList(Training, {},{ order: "asc" });
    const trainings = await Training.find().sort({ order: 1 });

    res.status(200).json({
      error: false,
      message: "Trainings are listed!",
      details: await res.getModelListDetails(Training),
      data: trainings,
    });
  },
  create: async (req, res) => {
    /*
            #swagger.tags = ["Training"]
            #swagger.summary = "Create new Training"
            #swagger.description = `
                Create a new training!</br></br>
                <b>Permission= Admin User</b></br></br> 
                - title length max:40</br>
                - description length max:300</br>  
                - order field is number, 1,2,3,4 -> for manual order, user can select the order</br> 
                - time field string, max length: 25</br> 
                - points -> array of string, each string maxlength: 100</br>  
                - Required fields: - title, description, order, time, points</br>  

            `

 
            #swagger.consumes = ['application/json']    
   


            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $title : 'test training', 
                    $description : 'desc',
                    $order : 1  ,
                    $time : '48 saat', 
                    $points : ["point 1", "point 2"] 

                }
            }
            #swagger.responses[201] = {
            description: 'Successfully created!',
            schema: { 
                error: false,
                message: "A new training is created!",
                data:{$ref: '#/definitions/Training'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request </br>
                - title, description, order, time, points fields are required!</br>  
                - Length errors</br>
                `
            } 



        */

    const { title, description, order, time, points } = req.body;

    //check if the payload is sended correctly by training
    mustRequirementOr400({
      title,
      description,
      order,
      time,
      points,
    });

    lengthValidationOr400(title, "title", 1, 40);
    lengthValidationOr400(description, "description", 1, 300);
    lengthValidationOr400(time, "time", 1, 25);

    // deleting dates from request body
    // delete req.body.image;
    delete req.body.createdAt;
    delete req.body.updatedAt;

    // const file = req.file;

    // let resultImage;
    // if (file) {
    //   // Resmi Cloudinary'ye yükle
    //   resultImage = await cloudinary.uploader.upload(file.path, {
    //     folder: "training",
    //     // width: 300,
    //     // crop: "scale"
    //   });
    //   req.body.image = {
    //     public_id: resultImage?.public_id,
    //     url: resultImage?.secure_url,
    //   };
    // }
    // try {
      //create training
      const newTraining = await Training.create(req.body);

      res.status(201).json({
        error: false,
        message: "A new training is created!",
        data: newTraining,
      });
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

  read: async (req, res) => {
    /*
            #swagger.tags = ["Training"]
            #swagger.summary = "Get a training"
            #swagger.description = `
                Get a training by id!!</br></br>
                <b>Permission= No Permission</b></br> 
                </br>    
                `
            
            #swagger.responses[200] = {
            description: 'Successfully found!',
            schema: { 
                error: false,
                message: "Training is found!",
                data:{$ref: '#/definitions/Training'}  
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid trainingId (paramId) type(ObjectId)!`
            }
            #swagger.responses[404] = {
            description:`Not found - Training not found!`
            }



        */

    //check if the sended id is a valid mongoose object id
    idTypeValidationOr400(
      req.params.id,
      "Invalid trainingId (paramId) type(ObjectId)!"
    );
    // const isAdmin = req.user?.isAdmin;

    //search the training on training collection
    const training = await isExistOnTableOr404(
      Training,
      { _id: req.params.id },
      "Training not found!"
    );

    //admin user read restriction(email and userId)
    // if (!req.user?.isAdmin) {
    //   delete training?.email;
    //   delete training?.userId;
    // }

    res.status(200).json({
      error: false,
      message: "Training is found!",
      data: training,
    });
  },

  update: async (req, res) => {
    /*
            #swagger.tags = ["Training"]
            #swagger.summary = "Update a Training"
            #swagger.description = `
                Update a Training by id!</br></br>
                <b>Permission= Admin user</b></br> 
                - title length max:40</br>
                - description length max:300</br>  
                - order field is number, 1,2,3,4 -> for manual order, user can select the order</br> 
                - time field string, max length: 25</br> 
                - points -> array of string, each string maxlength: 100</br>  
                - Required fields: - title, description, order, time, points </br> 

            `

            #swagger.consumes = ['application/json']  
   

            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $title : 'test training', 
                    $description : 'desc',
                    $order : 1  ,
                    $time : '48 saat', 
                    $points : ["point 1", "point-2"]

                }
            }
            #swagger.responses[202] = {
            description: 'Successfully updated!',
            schema: { 
                error: false,
                message: "Training is updated!!",
                data:{modifiedCount:1},
                new:{$ref: '#/definitions/Training'} 
            }

        }  

            #swagger.responses[400] = {
                description:`Bad request 
                    </br>- Invalid trainingId(paramId) type(ObjectId)!
                - title, description, order, time, points fields are required!</br>  
                - Length errors</br>
                    `
            }
            #swagger.responses[404] = {
                description:`Not found </br>
                - Training not found for update!</br> 
                `
            }
            #swagger.responses[500] = {
                description:`Something went wrong! - asked record is found, but it couldn't be updated!`
            }



        */

    //check if the sended id is a valid mongoose object id
    idTypeValidationOr400(
      req.params.id,
      "Invalid trainingId(paramId) type(ObjectId)!"
    );

    //destruct the req body fields
    const { title, description, order, time, points } = req.body;

    //check if the payload is sended correctly by training
    mustRequirementOr400({
      title,
      description,
      order,
      time,
      points,
    });

    lengthValidationOr400(title, "title", 1, 40);
    lengthValidationOr400(description, "description", 1, 300);
    lengthValidationOr400(time, "time", 1, 25);

    //search the training on training collection
    const training = await isExistOnTableOr404(
      Training,
      { _id: req.params.id },
      "Training not found for update!"
    );

    //delete date signatures form payload
    delete req.body.createdAt;
    delete req.body.updatedAt;
    // delete req.body.image;

    // const file = req.file;

    // let resultImage;

    // if (file) {
    //   console.log("file", file);

    //   resultImage = await cloudinary.uploader.upload(file.path, {
    //     folder: "training",
    //     // width: 300,
    //     // crop: "scale"
    //   });
    //   req.body.image = {
    //     public_id: resultImage?.public_id,
    //     url: resultImage?.secure_url,
    //   };
    // }

    //update the training with new data
    const data = await Training.updateOne({ _id: req.params.id }, req.body, {
      runValidators: true,
    });

    //check if the training updated or not
    if (data?.modifiedCount < 1) {
      // updating failed

      // delete the uploaded image from cloudinary if it failed to update
      // if (resultImage) {
      //   await cloudinary.uploader.destroy(resultImage.public_id);
      // }

      throw new CustomError(
        "Something went wrong! - asked record is found, but it couldn't be updated!",
        500
      );
    }

    //updated successfully
    //delete the old image from cloudinary if it successed to update
    // await cloudinary.uploader
    //   .destroy(training?.image?.public_id)
    //   .then(() =>
    //     console.log(training?.image?.public_id + " is deleted from cloudinary!")
    //   );

    //return the updated training with new data
    res.status(202).json({
      error: false,
      message: "Training member is updated!",
      data,
      new: await Training.findOne({ _id: req.params.id }),
    });
  },

  //   partialUpdate: async (req, res) => {
  //     /*
  //             #swagger.tags = ["Trainings"]
  //             #swagger.summary = "Partial Update"
  //             #swagger.description = `
  //                 Partial Update a Training by id!</br></br>
  //                 <b>Permission= Normal training</b></br>
  //                 - Admin trainings can be update.d just by admin trainings</br>
  //                 - Other trainings can update just theirselves</br>
  //                 - isAdmin modification is accessible for just the admin trainings!</br> </br>
  //                 - Password type Rules- [lenght:8-16, at least: 1 upper, 1 lower, 1 number, 1 special[@$!%*?&]]</br>
  //                 - trainingname field can't contain any space char!</br>
  //                 - trainingname length max:40</br>
  //                 - fullName length max:40</br>
  //                 - email length max:100</br>
  //                 - Email type Rules- --@--.--</br>
  //                 - Required fields: - At least one of the trainingname, password, fullName, email, gender, isAdmin fields is required!</br>
  //  `

  //             #swagger.consumes = ['application/json']

  //             #swagger.parameters['body']={
  //                 in:'body',
  //                 description:'One field is enough!',
  //                 required:true,
  //                 schema:{
  //                     trainingname : 'testtraining',
  //                     password : 'Password1*',
  //                     fullName : 'firstname',
  //                     email : 'email',
  //                     isAdmin : false,

  //                 }
  //             }
  //             #swagger.responses[202] = {
  //             description: 'Successfully partially updated!',
  //             schema: {
  //                 error: false,
  //                 message: "Training is partially updated!!",
  //                 data:{modifiedCount:1},
  //                 new:{$ref: '#/definitions/Training'}
  //             }

  //         }

  //             #swagger.responses[400] = {
  //                 description:`Bad request
  //                     </br>- Invalid trainingId(paramId) type(ObjectId)!
  //                     </br>- At least one field of trainingname, password, fullName, email, isAdmin fields is required!
  //                     </br>- Non-admin trainings can't modify other trainings!
  //                     </br>- trainingname field can't contain any space char!
  //                      </br>- Length errors

  //                     `
  //             }
  //             #swagger.responses[404] = {
  //                 description:`Not found - Training not found for partial update!`
  //             }
  //             #swagger.responses[500] = {
  //                 description:`Something went wrong! - asked record is found, but it couldn't be updated!`
  //             }

  //         */

  //     //check if the sended id is a valid mongoose object id
  //     idTypeValidationOr400(
  //       req.params.id,
  //       "Invalid trainingId(paramId) type(ObjectId)!"
  //     );

  //     //destruct the req body fields
  //     const { trainingname, password, fullName, isAdmin, email } = req.body;

  //     //check if the payload is sended correctly by training
  //     partialRequirementOr400({
  //       trainingname,
  //       password,
  //       fullName,
  //       isAdmin,
  //       email,
  //     });

  //     if (trainingname.trim().contains(" ")) {
  //       throw new CustomError(
  //         "trainingname field can't contain any space char!",
  //         400
  //       );
  //     }

  //     lengthValidationOr400(trainingname, "trainingname", 1, 40);
  //     lengthValidationOr400(fullName, "fullName", 1, 40);
  //     lengthValidationOr400(email, "email", 1, 100);

  //     //search training
  //     const training = await isExistOnTableOr404(
  //       Training,
  //       { _id: req.params.id },
  //       "Training not found for partial update!"
  //     );

  //     //admin restrictions
  //     /*-----------------*/
  //     if (!req?.training?.isAdmin) {
  //       if (req.training?._id != req.params.id) {
  //         throw new CustomError("Non-admin trainings can't modify other trainings!", 400);
  //       }
  //     }

  //     //admin modifications are accessible for just the admin trainings!
  //     if (!req?.training?.isAdmin) {
  //       //if training is not a admin training!
  //       req.body.isAdmin = training?.isAdmin;
  //     }

  //     //delete date signatures form payload
  //     delete req.body.createdAt;
  //     delete req.body.updatedAt;

  //     //update the training with new data
  //     const { modifiedCount } = await Training.updateOne(
  //       { _id: req.params.id },
  //       req.body,
  //       { runValidators: true }
  //     );

  //     //check if the training updated or not
  //     if (modifiedCount < 1) {
  //       throw new CustomError(
  //         "Something went wrong! - asked record is found, but it couldn't be updated!",
  //         500
  //       );
  //     }

  //     //return the updated training with new data
  //     res.status(202).json({
  //       error: false,
  //       message: "Training is partially updated!",
  //       result: await Training.findOne({ _id: req.params.id }),
  //     });
  //   },

  delete: async (req, res) => {
    /*
            #swagger.tags = ["Training"]
            #swagger.summary = "Delete a training"
            #swagger.description = `
                Delete a training by id!!</br></br>
                <b>Permission= Admin user</b></br>  
                ` 
            
            #swagger.responses[204] = {
            description: 'Successfully deleted!'

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid trainingId(paramId) type(ObjectId)!`
            }
            #swagger.responses[404] = {
            description:`Not found - Training not found for delete!`
            }

            #swagger.responses[500] = {
                description:`Something went wrong! - asked record is found, but it couldn't be updated!`
            }

        */

    // check if the sended id is a valid mongoose object id
    idTypeValidationOr400(
      req.params.id,
      "Invalid trainingId(paramId) type(ObjectId)!"
    );

    // find the training by id
    const training = await isExistOnTableOr404(
      Training,
      { _id: req.params.id },
      "Training member not found for delete!"
    );

    //delete training
    const { deletedCount } = await Training.deleteOne({ _id: req.params.id });
    //check if the training is deleted
    if (deletedCount < 1) {
      throw new CustomError(
        "Something went wrong! - asked record is found, but it couldn't be deleted!",
        500
      );
    }

    //delete old image
    // await cloudinary.uploader
    //   .destroy(training?.image?.public_id)
    //   .then(() =>
    //     console.log(training?.image?.public_id + " is deleted from cloudinary!")
    //   );

    //the result
    res.sendStatus(204);
  },
};
