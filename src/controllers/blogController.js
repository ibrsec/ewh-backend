"use strict";
 
const CustomError = require("../errors/customError");
const { Blog } = require("../models/blogModel");
const {
  mustRequirementOr400,
  idTypeValidationOr400,
  isExistOnTableOr404, 
  lengthValidationOr400,
} = require("../helpers/utils"); 
const cloudinary = require("../helpers/cloudinary");
const  sanitizeContent  = require("../helpers/sanitizeContent");
const  escapeHtml  = require("../helpers/escapeHtml");

module.exports.blog = {
  list: async function (req, res) {
    /*
            #swagger.tags = ["Blog"]
            #swagger.summary = "List Blogs"
            #swagger.description = `
                List all blogs!</br></br>
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
                  message: "Blogs are listed!",
                  data:{$ref: '#/definitions/Blog'} 
              }
            }

            
    


        */

    // const isAdmin = req.user?.isAdmin;
    // let choosedFilter = { email: 0 };
    // if (req.user?.isAdmin) {
    //   choosedFilter = {};
    // }

    // const blogs = await res.getModelList(Blog, {},{ order: "asc" });
    const blogs = await Blog.find({},{content: 0}).sort({ order: 1 });


    res.status(200).json({
      error: false,
      message: "Blogs are listed!",
      details: await res.getModelListDetails(Blog),
      data: blogs,
    });
  },
  create: async (req, res) => {
    /*
            #swagger.tags = ["Blog"]
            #swagger.summary = "Create new Blog"
            #swagger.description = `
                Create a new blog!</br></br>
                <b>Permission= Admin User</b></br></br> 
                - title length max:150</br>
                - shortDescription length max:350</br>  
                - author length max:100</br> 
                - image max: 5 mb - required</br> 
                - order field is number, 1,2,3,4 -> for manual order, user can select the order</br> 
                - content field is html(string)</br>  
                - Required fields: - title, shortDescription, author, order, content and fileUploading(imageFile)</br>  

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
                    $title : 'test blog title', 
                    $shortDescription : '...shortDescription...', 
                    $author : 'blog author', 
                    $content : ' html content',
                    $order : 1  

                }
            }
            #swagger.responses[201] = {
            description: 'Successfully created!',
            schema: { 
                error: false,
                message: "A new blog is created!",
                data:{$ref: '#/definitions/Blog'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request </br>
                - title, author, order, content fields are required!</br>  
                - Length errors</br>
                `
            } 



        */

    const { title, shortDescription, author, order, content } = req.body;


    
    //check if the payload is sended correctly by blog
    mustRequirementOr400({
      title, shortDescription, author, order, content
    });
    
    // Kullanıcının gönderdiği içeriği temizleme
    const cleanSantizeContent = sanitizeContent(content);

    const safeContent = escapeHtml(cleanSantizeContent);

    req.body.content = safeContent.trim();



    lengthValidationOr400(title, "title", 1, 150);
    lengthValidationOr400(shortDescription, "shortDescription", 1, 350);
    lengthValidationOr400(author, "author", 1, 100);

    // deleting dates from request body
    delete req.body.image;
    delete req.body.createdAt;
    delete req.body.updatedAt;
    // delete req.body.imageData;

    const file = req.file;

    if (!file) {
      throw new CustomError("Blog image uploading is required!", 400);
    }

    // Resmi Cloudinary'ye yükle
    const resultImage = await cloudinary.uploader.upload(file.path, {
      folder: "blogs",
      // width: 300,
      // crop: "scale"
    });


    req.body.image = {
      public_id: resultImage?.public_id,
      url: resultImage?.secure_url,
    };

    try {
      //create blog
      const newBlog = await Blog.create(req.body);

      res.status(201).json({
        error: false,
        message: "A new blog is created!",
        data: newBlog,
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
            #swagger.tags = ["Blog"]
            #swagger.summary = "Get a blog"
            #swagger.description = `
                Get a blog member by id!!</br></br>
                <b>Permission= No Permission</b></br>  </br>    
                `
            
            #swagger.responses[200] = {
            description: 'Successfully found!',
            schema: { 
                error: false,
                message: "Blog is found!",
                data:{$ref: '#/definitions/Blog'}  
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid blogId (paramId) type(ObjectId)!`
            }
            #swagger.responses[404] = {
            description:`Not found - Blog not found!`
            }



        */

    //check if the sended id is a valid mongoose object id
    idTypeValidationOr400(
      req.params.id,
      "Invalid blogId (paramId) type(ObjectId)!"
    );
    // const isAdmin = req.user?.isAdmin;

    //search the blog on blog collection
    const blog = await isExistOnTableOr404(
      Blog,
      { _id: req.params.id },
      "Blog not found!"
    );

    //admin user read restriction(email and userId)
    // if (!req.user?.isAdmin) {
    //   delete blog?.email;
    //   delete blog?.userId;
    // }

    res.status(200).json({
      error: false,
      message: "Blog is found!",
      data: blog,
    });
  },

  update: async (req, res) => {
    /*
            #swagger.tags = ["Blog"]
            #swagger.summary = "Update a Blog"
            #swagger.description = `
                Update a Blog by id!</br></br>
                <b>Permission= Admin user</b></br>  
                - title length max:150</br>
                - shortDescription length max:350</br>  
                - author length max:100</br> 
                - image max: 5 mb - not required</br> 
                - order field is number, 1,2,3,4 -> for manual order, user can select the order</br> 
                - content field is html(string)</br>  
                - Required fields: - title, shortDescription, author, order, content</br> 

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
                    $title : 'test blog title', 
                    $shortDescription : '...shortDescription...', 
                    $author : 'blog author', 
                    $content : ' html content',
                    $order : 1  

                }
            }
            #swagger.responses[202] = {
            description: 'Successfully updated!',
            schema: { 
                error: false,
                message: "Blog is updated!!",
                data:{modifiedCount:1},
                new:{$ref: '#/definitions/Blog'} 
            }

        }  

            #swagger.responses[400] = {
                description:`Bad request 
                    </br>- Invalid blogId(paramId) type(ObjectId)!
                - title, shortDescription, author, order, content fields are required!</br>  
                - Length errors</br>
                    `
            }
            #swagger.responses[404] = {
                description:`Not found </br>
                - Blog not found for update!</br> 
                `
            }
            #swagger.responses[500] = {
                description:`Something went wrong! - asked record is found, but it couldn't be updated!`
            }



        */

    //check if the sended id is a valid mongoose object id
    idTypeValidationOr400(
      req.params.id,
      "Invalid blogId(paramId) type(ObjectId)!"
    );

    //destruct the req body fields
    const { title, shortDescription, author, order, content } = req.body;

    //check if the payload is sended correctly by blog
    mustRequirementOr400({
      title, shortDescription, author, order, content
    });

      // Kullanıcının gönderdiği içeriği temizleme
      const cleanSantizeContent = sanitizeContent(content);

      const safeContent = escapeHtml(cleanSantizeContent);
  
      req.body.content = safeContent.trim();


      lengthValidationOr400(title, "title", 1, 150);
      lengthValidationOr400(shortDescription, "shortDescription", 1, 350);
      lengthValidationOr400(author, "author", 1, 100);

      
    //search the blog on blog collection
    const blog = await isExistOnTableOr404(
      Blog,
      { _id: req.params.id },
      "Blog not found for update!"
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
        folder: "blogs",
        // width: 300,
        // crop: "scale"
      });
      req.body.image = {
        public_id: resultImage?.public_id,
        url: resultImage?.secure_url,
      };

    }

    //update the blog with new data
    const data = await Blog.updateOne({ _id: req.params.id }, req.body, {
      runValidators: true,
    });

    //check if the blog updated or not
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
        .destroy(blog?.image?.public_id)
        .then(() =>
          console.log(blog?.image?.public_id + " is deleted from cloudinary!")
        );


    //return the updated blog with new data
    res.status(202).json({
      error: false,
      message: "Blog is updated!",
      data,
      new: await Blog.findOne({ _id: req.params.id }),
    });
  },

  //   partialUpdate: async (req, res) => {
  //     /*
  //             #swagger.tags = ["Blogs"]
  //             #swagger.summary = "Partial Update"
  //             #swagger.description = `
  //                 Partial Update a Blog by id!</br></br>
  //                 <b>Permission= Normal blog</b></br>
  //                 - Admin blogs can be update.d just by admin blogs</br>
  //                 - Other blogs can update just theirselves</br>
  //                 - isAdmin modification is accessible for just the admin blogs!</br> </br>
  //                 - Password type Rules- [lenght:8-16, at least: 1 upper, 1 lower, 1 number, 1 special[@$!%*?&]]</br>
  //                 - blogname field can't contain any space char!</br>
  //                 - blogname length max:40</br>
  //                 - fullName length max:40</br>
  //                 - email length max:100</br>
  //                 - Email type Rules- --@--.--</br>
  //                 - Required fields: - At least one of the blogname, password, fullName, email, gender, isAdmin fields is required!</br>
  //  `

  //             #swagger.consumes = ['application/json']

  //             #swagger.parameters['body']={
  //                 in:'body',
  //                 description:'One field is enough!',
  //                 required:true,
  //                 schema:{
  //                     blogname : 'testblog',
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
  //                 message: "Blog is partially updated!!",
  //                 data:{modifiedCount:1},
  //                 new:{$ref: '#/definitions/Blog'}
  //             }

  //         }

  //             #swagger.responses[400] = {
  //                 description:`Bad request
  //                     </br>- Invalid blogId(paramId) type(ObjectId)!
  //                     </br>- At least one field of blogname, password, fullName, email, isAdmin fields is required!
  //                     </br>- Non-admin blogs can't modify other blogs!
  //                     </br>- blogname field can't contain any space char!
  //                      </br>- Length errors

  //                     `
  //             }
  //             #swagger.responses[404] = {
  //                 description:`Not found - Blog not found for partial update!`
  //             }
  //             #swagger.responses[500] = {
  //                 description:`Something went wrong! - asked record is found, but it couldn't be updated!`
  //             }

  //         */

  //     //check if the sended id is a valid mongoose object id
  //     idTypeValidationOr400(
  //       req.params.id,
  //       "Invalid blogId(paramId) type(ObjectId)!"
  //     );

  //     //destruct the req body fields
  //     const { blogname, password, fullName, isAdmin, email } = req.body;

  //     //check if the payload is sended correctly by blog
  //     partialRequirementOr400({
  //       blogname,
  //       password,
  //       fullName,
  //       isAdmin,
  //       email,
  //     });

  //     if (blogname.trim().contains(" ")) {
  //       throw new CustomError(
  //         "blogname field can't contain any space char!",
  //         400
  //       );
  //     }

  //     lengthValidationOr400(blogname, "blogname", 1, 40);
  //     lengthValidationOr400(fullName, "fullName", 1, 40);
  //     lengthValidationOr400(email, "email", 1, 100);

  //     //search blog
  //     const blog = await isExistOnTableOr404(
  //       Blog,
  //       { _id: req.params.id },
  //       "Blog not found for partial update!"
  //     );

  //     //admin restrictions
  //     /*-----------------*/
  //     if (!req?.blog?.isAdmin) {
  //       if (req.blog?._id != req.params.id) {
  //         throw new CustomError("Non-admin blogs can't modify other blogs!", 400);
  //       }
  //     }

  //     //admin modifications are accessible for just the admin blogs!
  //     if (!req?.blog?.isAdmin) {
  //       //if blog is not a admin blog!
  //       req.body.isAdmin = blog?.isAdmin;
  //     }

  //     //delete date signatures form payload
  //     delete req.body.createdAt;
  //     delete req.body.updatedAt;

  //     //update the blog with new data
  //     const { modifiedCount } = await Blog.updateOne(
  //       { _id: req.params.id },
  //       req.body,
  //       { runValidators: true }
  //     );

  //     //check if the blog updated or not
  //     if (modifiedCount < 1) {
  //       throw new CustomError(
  //         "Something went wrong! - asked record is found, but it couldn't be updated!",
  //         500
  //       );
  //     }

  //     //return the updated blog with new data
  //     res.status(202).json({
  //       error: false,
  //       message: "Blog is partially updated!",
  //       result: await Blog.findOne({ _id: req.params.id }),
  //     });
  //   },

  delete: async (req, res) => {
    /*
            #swagger.tags = ["Blog"]
            #swagger.summary = "Delete a blog"
            #swagger.description = `
                Delete a blog by id!!</br></br>
                <b>Permission= Admin user</b></br>  
                ` 
            
            #swagger.responses[204] = {
            description: 'Successfully deleted!'

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid blogId(paramId) type(ObjectId)!`
            }
            #swagger.responses[404] = {
            description:`Not found - Blog not found for delete!`
            }

            #swagger.responses[500] = {
                description:`Something went wrong! - asked record is found, but it couldn't be updated!`
            }

        */

    // check if the sended id is a valid mongoose object id
    idTypeValidationOr400(
      req.params.id,
      "Invalid blogId(paramId) type(ObjectId)!"
    );

    // find the blog by id
    const blog = await isExistOnTableOr404(
      Blog,
      { _id: req.params.id },
      "Blog not found for delete!"
    );

    //delete blog
    const { deletedCount } = await Blog.deleteOne({ _id: req.params.id });
    //check if the blog is deleted
    if (deletedCount < 1) {
      throw new CustomError(
        "Something went wrong! - asked record is found, but it couldn't be deleted!",
        500
      );
    }

    //delete old image
    await cloudinary.uploader
      .destroy(blog?.image?.public_id)
      .then(() =>
        console.log(blog?.image?.public_id + " is deleted from cloudinary!")
      );

    //the result
    res.sendStatus(204);
  },
};
