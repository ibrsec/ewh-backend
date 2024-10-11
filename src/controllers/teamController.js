"use strict";
 
const CustomError = require("../errors/customError");
const { Team } = require("../models/teamModel");
const {
  mustRequirementOr400,
  idTypeValidationOr400,
  isExistOnTableOr404, 
  lengthValidationOr400,
} = require("../helpers/utils"); 
const cloudinary = require("../helpers/cloudinary");

module.exports.team = {
  list: async function (req, res) {
    /*
            #swagger.tags = ["Team"]
            #swagger.summary = "List Team"
            #swagger.description = `
                List all teams!</br></br>
                <b>Permission= No Permission</b></br>  
                    - No admin users can't list emails of the team members</br></br> 
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
                  message: "Teams are listed!",
                  data:{$ref: '#/definitions/Team'} 
              }
            }

            
    


        */

    const isAdmin = req.user?.isAdmin;
    // let choosedFilter = { email: 0 };
    // if (req.user?.isAdmin) {
    //   choosedFilter = {};
    // }

    // const teams = await res.getModelList(Team, {},{ order: "asc" });
    const teams = await Team.find().sort({ order: 1 });

    // Her bir takım belgesini istenilen formatta düzenleyin
    const formattedTeams = teams.map((team) => {
      // console.log(team);
      // const base64Image = team?.image?.buffer.toString("base64");
      // const imgSrc = `data:${team.image.mimeType};base64,${base64Image}`;

      return {
        _id: team._id,
        fullName: team.fullName,
        description: team.description,
        email: isAdmin && team?.email,
        image: team.image, // sadece base64
        order: team.order,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      };
    });

    res.status(200).json({
      error: false,
      message: "Teams are listed!",
      details: await res.getModelListDetails(Team),
      data: formattedTeams,
    });
  },
  create: async (req, res) => {
    /*
            #swagger.tags = ["Team"]
            #swagger.summary = "Create new Team member"
            #swagger.description = `
                Create a new team member!</br></br>
                <b>Permission= Admin User</b></br></br> 
                - fullName length max:40</br>
                - description length max:300</br> 
                - image max: 5 mb - required</br> 
                - order field is number, 1,2,3,4 -> for manual order, user can select the order</br> 
                - email length max:100</br> 
                - Email type Rules- --@--.--</br>
                - Required fields: - fullName, description, email, order and fileUploading(imageFile)</br>  

            `

            #swagger.consumes = ['multipart/form-data']   
  
            #swagger.parameters['imageFile'] = {
                    in: 'formData',
                    type: 'file',
                    required: 'true',
                    description: 'max 5mb',
            }


            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $fullName : 'test team', 
                    $email : 'email@example.com', 
                    $description : 'desc',
                    $order : 1  

                }
            }
            #swagger.responses[201] = {
            description: 'Successfully created!',
            schema: { 
                error: false,
                message: "A new team member is created!",
                data:{$ref: '#/definitions/Team'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request </br>
                - fullName, description, email fields are required!</br>  
                - Length errors</br>
                `
            } 



        */

    const { fullName, description, email, order } = req.body;

    //check if the payload is sended correctly by team
    mustRequirementOr400({
      fullName,
      description,
      email,
      order,
    });

    lengthValidationOr400(fullName, "fullName", 1, 40);
    lengthValidationOr400(email, "email", 1, 100);
    // lengthValidationOr400(image, "image", 1, 500);
    lengthValidationOr400(description, "description", 1, 300);

    // deleting dates from request body
    delete req.body.image;
    delete req.body.createdAt;
    delete req.body.updatedAt;
    // delete req.body.imageData;

    const file = req.file;

    if (!file) {
      throw new CustomError("Team member image uploading is required!", 400);
    }

    // Resmi Cloudinary'ye yükle
    const resultImage = await cloudinary.uploader.upload(file.path, {
      folder: "teamMembers",
      // width: 300,
      // crop: "scale"
    });


    req.body.image = {
      public_id: resultImage?.public_id,
      url: resultImage?.secure_url,
    };

    try {
      //create team
      const newTeam = await Team.create(req.body);

      res.status(201).json({
        error: false,
        message: "A new team member is created!",
        data: newTeam,
      });

    } catch (error) {
      // Eğer bir hata olursa yüklenen resmi Cloudinary'den sil
      if (resultImage) {
        await cloudinary.uploader.destroy(resultImage.public_id);
      }
      throw new CustomError(error.message, error.statusCode);
    }

    
  },

  read: async (req, res) => {
    /*
            #swagger.tags = ["Team"]
            #swagger.summary = "Get a team member"
            #swagger.description = `
                Get a team member by id!!</br></br>
                <b>Permission= No Permission</b></br> 
                    - No admin users can't list emails and userIds of the team members</br></br>    
                `
            
            #swagger.responses[200] = {
            description: 'Successfully found!',
            schema: { 
                error: false,
                message: "Team member is found!",
                data:{$ref: '#/definitions/Team'}  
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid teamId (paramId) type(ObjectId)!`
            }
            #swagger.responses[404] = {
            description:`Not found - Team member not found!`
            }



        */

    //check if the sended id is a valid mongoose object id
    idTypeValidationOr400(
      req.params.id,
      "Invalid teamId (paramId) type(ObjectId)!"
    );
    const isAdmin = req.user?.isAdmin;

    //search the team on team collection
    const team = await isExistOnTableOr404(
      Team,
      { _id: req.params.id },
      "Team member not found!"
    );

    //admin user read restriction(email and userId)
    // if (!req.user?.isAdmin) {
    //   delete team?.email;
    //   delete team?.userId;
    // }

    res.status(200).json({
      error: false,
      message: "Team member is found!",
      data: {
        _id: team._id,
        fullName: team.fullName,
        description: team.description,
        email: isAdmin && team?.email,
        order,
        image: team.image, // sadece base64
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      },
    });
  },

  update: async (req, res) => {
    /*
            #swagger.tags = ["Team"]
            #swagger.summary = "Update a Team"
            #swagger.description = `
                Update a Team by id!</br></br>
                <b>Permission= Admin user</b></br>  
                - fullName length max:40</br>
                - description length max:300</br> 
                - image max: 5mb - not required</br> 
                - order field is number, 1,2,3,4 -> for manual order, user can select the order</br> 
                - email length max:100</br> 
                - Email type Rules- --@--.--</br>
                - Required fields: - fullName, description, email</br>   

            `

            #swagger.consumes = ['multipart/form-data']   
  
            #swagger.parameters['imageFile'] = {
                    in: 'formData',
                    type: 'file',
                    required: 'false',
                    description: 'max 5mb - not required',
            } 

            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $fullName : 'test team', 
                    $email : 'email@example.com', 
                    $description : 'desc',
                    $order : 2,

                }
            }
            #swagger.responses[202] = {
            description: 'Successfully updated!',
            schema: { 
                error: false,
                message: "Team member is updated!!",
                data:{modifiedCount:1},
                new:{$ref: '#/definitions/Team'} 
            }

        }  

            #swagger.responses[400] = {
                description:`Bad request 
                    </br>- Invalid teamId(paramId) type(ObjectId)!
                - fullName, description, image, email fields are required!</br>  
                - Length errors</br>
                    `
            }
            #swagger.responses[404] = {
                description:`Not found </br>
                - Team member not found for update!</br> 
                `
            }
            #swagger.responses[500] = {
                description:`Something went wrong! - asked record is found, but it couldn't be updated!`
            }



        */

    //check if the sended id is a valid mongoose object id
    idTypeValidationOr400(
      req.params.id,
      "Invalid teamId(paramId) type(ObjectId)!"
    );

    //destruct the req body fields
    const { fullName, description, email, order } = req.body;

    //check if the payload is sended correctly by team
    mustRequirementOr400({
      fullName,
      description,
      email,
      order,
    });
    lengthValidationOr400(fullName, "fullName", 1, 40);
    lengthValidationOr400(email, "email", 1, 100);
    // lengthValidationOr400(image, "image", 1, 500);
    lengthValidationOr400(description, "description", 1, 300);

    //search the team on team collection
    const team = await isExistOnTableOr404(
      Team,
      { _id: req.params.id },
      "Team member not found for update!"
    );

    //delete date signatures form payload
    delete req.body.createdAt;
    delete req.body.updatedAt;
    delete req.body.image;

    const file = req.file;

    let resultImage;

    if (file) {
      console.log("file", file);

      resultImage = await cloudinary.uploader.upload(file.path, {
        folder: "teamMembers",
        // width: 300,
        // crop: "scale"
      });
      req.body.image = {
        public_id: resultImage?.public_id,
        url: resultImage?.secure_url,
      };

    }

    //update the team with new data
    const data = await Team.updateOne({ _id: req.params.id }, req.body, {
      runValidators: true,
    });

    //check if the team updated or not
    if (data?.modifiedCount < 1) {


      // updating failed

      // delete the uploaded image from cloudinary if mongodb failed to update
      if (resultImage) {
        await cloudinary.uploader.destroy(resultImage.public_id);
      }


      throw new CustomError(
        "Something went wrong! - asked record is found, but it couldn't be updated!",
        500
      );
    }


      // delete the uploaded image from cloudinary if it failed to update
      await cloudinary.uploader
        .destroy(team?.image?.public_id)
        .then(() =>
          console.log(team?.image?.public_id + " is deleted from cloudinary!")
        );


    //return the updated team with new data
    res.status(202).json({
      error: false,
      message: "Team member is updated!",
      data,
      new: await Team.findOne({ _id: req.params.id }),
    });
  },

  //   partialUpdate: async (req, res) => {
  //     /*
  //             #swagger.tags = ["Teams"]
  //             #swagger.summary = "Partial Update"
  //             #swagger.description = `
  //                 Partial Update a Team by id!</br></br>
  //                 <b>Permission= Normal team</b></br>
  //                 - Admin teams can be update.d just by admin teams</br>
  //                 - Other teams can update just theirselves</br>
  //                 - isAdmin modification is accessible for just the admin teams!</br> </br>
  //                 - Password type Rules- [lenght:8-16, at least: 1 upper, 1 lower, 1 number, 1 special[@$!%*?&]]</br>
  //                 - teamname field can't contain any space char!</br>
  //                 - teamname length max:40</br>
  //                 - fullName length max:40</br>
  //                 - email length max:100</br>
  //                 - Email type Rules- --@--.--</br>
  //                 - Required fields: - At least one of the teamname, password, fullName, email, gender, isAdmin fields is required!</br>
  //  `

  //             #swagger.consumes = ['application/json']

  //             #swagger.parameters['body']={
  //                 in:'body',
  //                 description:'One field is enough!',
  //                 required:true,
  //                 schema:{
  //                     teamname : 'testteam',
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
  //                 message: "Team is partially updated!!",
  //                 data:{modifiedCount:1},
  //                 new:{$ref: '#/definitions/Team'}
  //             }

  //         }

  //             #swagger.responses[400] = {
  //                 description:`Bad request
  //                     </br>- Invalid teamId(paramId) type(ObjectId)!
  //                     </br>- At least one field of teamname, password, fullName, email, isAdmin fields is required!
  //                     </br>- Non-admin teams can't modify other teams!
  //                     </br>- teamname field can't contain any space char!
  //                      </br>- Length errors

  //                     `
  //             }
  //             #swagger.responses[404] = {
  //                 description:`Not found - Team not found for partial update!`
  //             }
  //             #swagger.responses[500] = {
  //                 description:`Something went wrong! - asked record is found, but it couldn't be updated!`
  //             }

  //         */

  //     //check if the sended id is a valid mongoose object id
  //     idTypeValidationOr400(
  //       req.params.id,
  //       "Invalid teamId(paramId) type(ObjectId)!"
  //     );

  //     //destruct the req body fields
  //     const { teamname, password, fullName, isAdmin, email } = req.body;

  //     //check if the payload is sended correctly by team
  //     partialRequirementOr400({
  //       teamname,
  //       password,
  //       fullName,
  //       isAdmin,
  //       email,
  //     });

  //     if (teamname.trim().contains(" ")) {
  //       throw new CustomError(
  //         "teamname field can't contain any space char!",
  //         400
  //       );
  //     }

  //     lengthValidationOr400(teamname, "teamname", 1, 40);
  //     lengthValidationOr400(fullName, "fullName", 1, 40);
  //     lengthValidationOr400(email, "email", 1, 100);

  //     //search team
  //     const team = await isExistOnTableOr404(
  //       Team,
  //       { _id: req.params.id },
  //       "Team not found for partial update!"
  //     );

  //     //admin restrictions
  //     /*-----------------*/
  //     if (!req?.team?.isAdmin) {
  //       if (req.team?._id != req.params.id) {
  //         throw new CustomError("Non-admin teams can't modify other teams!", 400);
  //       }
  //     }

  //     //admin modifications are accessible for just the admin teams!
  //     if (!req?.team?.isAdmin) {
  //       //if team is not a admin team!
  //       req.body.isAdmin = team?.isAdmin;
  //     }

  //     //delete date signatures form payload
  //     delete req.body.createdAt;
  //     delete req.body.updatedAt;

  //     //update the team with new data
  //     const { modifiedCount } = await Team.updateOne(
  //       { _id: req.params.id },
  //       req.body,
  //       { runValidators: true }
  //     );

  //     //check if the team updated or not
  //     if (modifiedCount < 1) {
  //       throw new CustomError(
  //         "Something went wrong! - asked record is found, but it couldn't be updated!",
  //         500
  //       );
  //     }

  //     //return the updated team with new data
  //     res.status(202).json({
  //       error: false,
  //       message: "Team is partially updated!",
  //       result: await Team.findOne({ _id: req.params.id }),
  //     });
  //   },

  delete: async (req, res) => {
    /*
            #swagger.tags = ["Team"]
            #swagger.summary = "Delete a team member"
            #swagger.description = `
                Delete a team member by id!!</br></br>
                <b>Permission= Admin user</b></br>  
                ` 
            
            #swagger.responses[204] = {
            description: 'Successfully deleted!'

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid teamId(paramId) type(ObjectId)!`
            }
            #swagger.responses[404] = {
            description:`Not found - Team member not found for delete!`
            }

            #swagger.responses[500] = {
                description:`Something went wrong! - asked record is found, but it couldn't be updated!`
            }

        */

    // check if the sended id is a valid mongoose object id
    idTypeValidationOr400(
      req.params.id,
      "Invalid teamId(paramId) type(ObjectId)!"
    );

    // find the team by id
    const team = await isExistOnTableOr404(
      Team,
      { _id: req.params.id },
      "Team member not found for delete!"
    );

    //delete team
    const { deletedCount } = await Team.deleteOne({ _id: req.params.id });
    //check if the team is deleted
    if (deletedCount < 1) {
      throw new CustomError(
        "Something went wrong! - asked record is found, but it couldn't be deleted!",
        500
      );
    }

    //delete old image
    await cloudinary.uploader
      .destroy(team?.image?.public_id)
      .then(() =>
        console.log(team?.image?.public_id + " is deleted from cloudinary!")
      );

    //the result
    res.sendStatus(204);
  },
};
