"use strict";

const { User } = require("../models/userModel");

module.exports = async () => {
  // return null;
  const adminUser = await User.findOne({ isAdmin: true });
  if (!adminUser) {
    await User.create({
      username: "adminuser", 
      password: "Aa*12345",
      fullName: "adminfirst",
      email: "ibr.seckin@gmail.com",  
      isAdmin: true, 
      gender:"male",
      image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6jr5QyaNWzkPClr4Qpln80ceo_HAoVx86IA&s',
    });
    console.log("admin user is added!");
  } else {
    console.log("admin user is already exist!");
  }
  console.log("adminUser= ", adminUser);
};
