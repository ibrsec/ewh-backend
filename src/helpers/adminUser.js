"use strict";

const { User } = require("../models/userModel");

module.exports = async () => {
  // return null;
  const adminUser = await User.findOne({ isAdmin: true });
  if (!adminUser) {
    await User.create({
      username: process.env.ADMIN_USER, 
      password: process.env.ADMIN_PASSWORD,
      fullName: "admin user",
      email: process.env.ADMIN_EMAIL,  
      isAdmin: true,   
    });
    console.log("admin user is added!");
  } else {
    console.log("admin user is already exist!");
  }
  console.log("adminUser= ", adminUser);
};
