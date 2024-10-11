"use strict";

const jwt = require("jsonwebtoken");
const { mongoose } = require("../configs/dbConnection");
const CustomError = require("../errors/customError");
const passwordEncryptor = require("../helpers/passwordEncryptor");
const { Token } = require("../models/tokenModel");
const { User } = require("../models/userModel");
const {
  mustRequirementOr400,
  idTypeValidationOr400,
  isExistOnTableOr404,
  partialRequirementOr400,
  lengthValidationOr400,
} = require("../helpers/utils");

module.exports.user = {
  list: async function (req, res) {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "List Users"
            #swagger.description = `
                List all users!</br></br>
                <b>Permission= Loginned user</b></br> 
                - Normal users can't list other users</br>
                - Admin users can list everyone</br></br>
                Token endpoint is hidden </br></br>
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
                    message: "Users are listed!",
                    data:{$ref: '#/definitions/User'} 
                }
            }


        */

    //restrict listing user to non admin users = they wont see the admins

    let customFilters = { _id: req.user._id };
    if (req.user?.isAdmin) {
      customFilters = {};
    }

    const users = await res.getModelList(User, customFilters);
    res.status(200).json({
      error: false,
      message: "Users are listed!",
      details: await res.getModelListDetails(User, customFilters),
      data: users,
    });
  },
  create: async (req, res) => {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Create new User"
            #swagger.description = `
                Create a new user!</br></br>
                <b>Permission= No Permission</b></br> 
                - Admin users can be create.d just by admin users</br></br>
                - username cant contain space chars</br>
                - Password type Rules- [lenght:8-16, at least: 1 upper, 1 lower, 1 number, 1 special[@$!%*?&]]</br>
                - username length max:40</br>
                - fullName length max:40</br>
                - email length max:100</br> 
                - Email type Rules- --@--.--</br>
                - Required fields: - username, password, fullName, email</br>  

            `

            #swagger.consumes = ['application/json']   


            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $username : 'testuser', 
                    $password : 'Password1*',
                    $fullName : 'full name', 
                    $email : 'email',  
                    isAdmin : false, 

                }
            }
            #swagger.responses[201] = {
            description: 'Successfully created!',
            schema: { 
                error: false,
                message: "Your account has been successfully created!",
                token:"tokenkey",
                bearer:{
                  accessToken:"accestoken key",
                  refreshToken:"refreshtoken key",
                },
                data:{$ref: '#/definitions/User'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request </br>
                - username, password, fullName, email fields are required!</br>
                - username field can't contain any space char!</br>
                - Length errors</br>
                `
            }



        */

    const { username, password, fullName, email } = req.body;

    //check if the payload is sended correctly by user
    mustRequirementOr400({
      username,
      password,
      fullName,
      email,
    });

    if(username.trim().contains(" ")){
      throw new CustomError("username field can't contain any space char!",400)
    }

    lengthValidationOr400(username,"username",1,40)
    lengthValidationOr400(fullName,"fullName",1,40)
    lengthValidationOr400(email,"email",1,100) 




    //admin user creation restriction
    if (!req?.user?.isAdmin) {
      //if user is not a admin user!
      req.body.isAdmin = false;
    }

    //password encryptor is happenning in userModel

    // deleting dates from request body
    delete req.body.createdAt;
    delete req.body.updatedAt;

    //create user
    const newUser = await User.create(req.body);

    /* ------- AUTO LOGIN ------- */
    // SimpleToken:
    const tokenData = await Token.create({
      userId: newUser._id,
      token: passwordEncryptor(newUser._id + Date.now()),
    });
    // JWT:
    const accessTokenData = {
      _id: newUser._id,
      username: newUser?.username,
      isAdmin: newUser?.isAdmin,
    };

    const accessToken = jwt.sign(accessTokenData, process.env.ACCESS_KEY, {
      expiresIn: "30m",
    });

    const refreshTokenData = {
      username: newUser?.username,
      password: newUser?.password,
    };

    const refreshToken = jwt.sign(refreshTokenData, process.env.REFRESH_KEY, {
      expiresIn: "1d",
    });
    /* ------- AUTO LOGIN ------- */

    res.status(201).json({
      error: false,
      message: "Your account has been successfully created!",
      token: tokenData.token,
      bearer: { accessToken, refreshToken },
      data: newUser,
    });
  },

  read: async (req, res) => {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Get a user"
            #swagger.description = `
                Get a user by id!!</br></br>
                <b>Permission= Loginned user</b></br> 
                - Admin can list all users!</br> 
                - Normal user can list just theirselves!</br></br> 
            
            #swagger.responses[200] = {
            description: 'Successfully found!',
            schema: { 
                error: false,
                message: "User is found!",
                data:{$ref: '#/definitions/User'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid userId (paramId) type(ObjectId)!`
            }
            #swagger.responses[404] = {
            description:`Not found - User not found!`
            }



        */

    //check if the sended id is a valid mongoose object id
    idTypeValidationOr400(
      req.params.id,
      "Invalid userId (paramId) type(ObjectId)!"
    );

    //admin user read restriction
    if (!req.user?.isAdmin) {
      req.params.id = req.user._id;
    }

    //search the user on user collection
    const user = await isExistOnTableOr404(
      User,
      { _id: req.params.id },
      "User not found!"
    );
    // const user = await User.findOne({ _id: req.params.id });

    // if (!user) {
    //   throw new CustomError("User not found!", 404);
    // }

    res.status(200).json({
      error: false,
      message: "User is found!",
      data: user,
    });
  },

  update: async (req, res) => {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Update a User"
            #swagger.description = `
                Update a User by id!</br></br>
                <b>Permission= Normal user</b></br> 
                - Admin users can be update.d just by admin users</br> 
                - Other users can update theirselves</br>
                - isAdmin modification is accessible for just the admin users!</br> </br>
                - Password type Rules- [lenght:8-16, at least: 1 upper, 1 lower, 1 number, 1 special[@$!%*?&]]</br>
                - username field can't contain any space char!</br>
                - username length max:40</br>
                - fullName length max:40</br>
                - email length max:100</br> 
                - Email type Rules- --@--.--</br>
                - Required fields: - username, password, fullName, email</br> 

            `


            #swagger.consumes = ['application/json']   

            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $username : 'testuser', 
                    $password : 'Password1*',
                    $fullName : 'firstname', 
                    $email : 'email',  
                    isAdmin : false, 

                }
            }
            #swagger.responses[202] = {
            description: 'Successfully updated!',
            schema: { 
                error: false,
                message: "User is updated!!",
                data:{modifiedCount:1},
                new:{$ref: '#/definitions/User'} 
            }

        }  

            #swagger.responses[400] = {
                description:`Bad request 
                    </br>- Invalid userId(paramId) type(ObjectId)!
                    </br>- username, password, fullName, email fields are required!
                    </br>- Non-admin users can't modify other users!
                    </br>- username field can't contain any space char!
                    </br>- Length errors
                    `
            }
            #swagger.responses[404] = {
                description:`Not found - User not found for update!`
            }
            #swagger.responses[500] = {
                description:`Something went wrong! - asked record is found, but it couldn't be updated!`
            }



        */

    //check if the sended id is a valid mongoose object id
    idTypeValidationOr400(
      req.params.id,
      "Invalid userId(paramId) type(ObjectId)!"
    );

    //destruct the req body fields
    const { username, password, fullName, email } = req.body;

    //check if the payload is sended correctly by user
    mustRequirementOr400({
      username,
      password,
      fullName,
      email,
    });

    if(username.trim().contains(" ")){
      throw new CustomError("username field can't contain any space char!",400)
    }


    lengthValidationOr400(username,"username",1,40)
    lengthValidationOr400(fullName,"fullName",1,40)
    lengthValidationOr400(email,"email",1,100) 

    
    //search the user
    const user = await isExistOnTableOr404(
      User,
      { _id: req.params.id },
      "User not found for update!"
    );

    //admin restrictions
    if (!req?.user?.isAdmin) {
      if (req.user?._id != req.params.id) {
        throw new CustomError("Non-admin users can't modify other users!", 400);
      }
    }

    //admin  modifications are accessible for just the admin users!
    if (!req?.user?.isAdmin) {
      //if user is not a admin user!
      req.body.isAdmin = user?.isAdmin;
    }

    //delete date signatures form payload
    delete req.body.createdAt;
    delete req.body.updatedAt;

    //update the user with new data
    const data = await User.updateOne({ _id: req.params.id }, req.body, {
      runValidators: true,
    });

    //check if the user updated or not
    if (data?.modifiedCount < 1) {
      throw new CustomError(
        "Something went wrong! - asked record is found, but it couldn't be updated!",
        500
      );
    }

    //return the updated user with new data
    res.status(202).json({
      error: false,
      message: "User is updated!",
      data,
      new: await User.findOne({ _id: req.params.id }),
    });
  },

  partialUpdate: async (req, res) => {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Partial Update"
            #swagger.description = `
                Partial Update a User by id!</br></br>
                <b>Permission= Normal user</b></br> 
                - Admin users can be update.d just by admin users</br>
                - Other users can update just theirselves</br>
                - isAdmin modification is accessible for just the admin users!</br> </br>
                - Password type Rules- [lenght:8-16, at least: 1 upper, 1 lower, 1 number, 1 special[@$!%*?&]]</br>
                - username field can't contain any space char!</br>
                - username length max:40</br>
                - fullName length max:40</br>
                - email length max:100</br> 
                - Email type Rules- --@--.--</br>
                - Required fields: - At least one of the username, password, fullName, email, gender, isAdmin fields is required!</br> 
 `


            #swagger.consumes = ['application/json'] 

            
            #swagger.parameters['body']={
                in:'body',
                description:'One field is enough!',
                required:true,
                schema:{
                    username : 'testuser', 
                    password : 'Password1*',
                    fullName : 'firstname', 
                    email : 'email',  
                    isAdmin : false, 

                }
            }
            #swagger.responses[202] = {
            description: 'Successfully partially updated!',
            schema: { 
                error: false,
                message: "User is partially updated!!",
                data:{modifiedCount:1},
                new:{$ref: '#/definitions/User'} 
            }

        }  

            #swagger.responses[400] = {
                description:`Bad request 
                    </br>- Invalid userId(paramId) type(ObjectId)!
                    </br>- At least one field of username, password, fullName, email, isAdmin fields is required!
                    </br>- Non-admin users can't modify other users!
                    </br>- username field can't contain any space char!
                     </br>- Length errors
                    
                    `
            }
            #swagger.responses[404] = {
                description:`Not found - User not found for partial update!`
            }
            #swagger.responses[500] = {
                description:`Something went wrong! - asked record is found, but it couldn't be updated!`
            }



        */

    //check if the sended id is a valid mongoose object id
    idTypeValidationOr400(
      req.params.id,
      "Invalid userId(paramId) type(ObjectId)!"
    );

    //destruct the req body fields
    const { username, password, fullName, isAdmin, email } = req.body;

    //check if the payload is sended correctly by user
    partialRequirementOr400({
      username,
      password,
      fullName,
      isAdmin,
      email,
    });


    if(username.trim().contains(" ")){
      throw new CustomError("username field can't contain any space char!",400)
    }


    lengthValidationOr400(username,"username",1,40)
    lengthValidationOr400(fullName,"fullName",1,40)
    lengthValidationOr400(email,"email",1,100) 

    //search user
    const user = await isExistOnTableOr404(
      User,
      { _id: req.params.id },
      "User not found for partial update!"
    );

    //admin restrictions
    /*-----------------*/
    if (!req?.user?.isAdmin) {
      if (req.user?._id != req.params.id) {
        throw new CustomError("Non-admin users can't modify other users!", 400);
      }
    }

    //admin modifications are accessible for just the admin users!
    if (!req?.user?.isAdmin) {
      //if user is not a admin user!
      req.body.isAdmin = user?.isAdmin;
    }
 

    //delete date signatures form payload
    delete req.body.createdAt;
    delete req.body.updatedAt;

    //update the user with new data
    const { modifiedCount } = await User.updateOne(
      { _id: req.params.id },
      req.body,
      { runValidators: true }
    );

    //check if the user updated or not
    if (modifiedCount < 1) {
      throw new CustomError(
        "Something went wrong! - asked record is found, but it couldn't be updated!",
        500
      );
    }

    //return the updated user with new data
    res.status(202).json({
      error: false,
      message: "User is partially updated!",
      result: await User.findOne({ _id: req.params.id }),
    });
  },

  delete: async (req, res) => {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Delete a user"
            #swagger.description = `
                Delete a user by id!!</br></br>
                <b>Permission= Admin user</b></br> 
                - Admin can delete all users!</br>
                - Other users can't delete any user!</br> 
            
            #swagger.responses[204] = {
            description: 'Successfully deleted!'

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid userId(paramId) type(ObjectId)!`
            }
            #swagger.responses[404] = {
            description:`Not found - User not found fro delete!`
            }

            #swagger.responses[500] = {
                description:`Something went wrong! - asked record is found, but it couldn't be updated!`
            }

        */

    // check if the sended id is a valid mongoose object id
    idTypeValidationOr400(
      req.params.id,
      "Invalid userId(paramId) type(ObjectId)!"
    );

    // find the user by id
    const user = await isExistOnTableOr404(
      User,
      { _id: req.params.id },
      "User not found for delete!"
    );

    //delete user
    const { deletedCount } = await User.deleteOne({ _id: req.params.id });
    //check if the user is deleted
    if (deletedCount < 1) {
      throw new CustomError(
        "Something went wrong! - asked record is found, but it couldn't be deleted!",
        500
      );
    }

    //the result
    res.sendStatus(204);
  },
};
