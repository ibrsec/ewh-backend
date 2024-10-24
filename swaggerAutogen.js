"use strict";

require("dotenv").config();
const PORT = process.env.PORT;
const HOST = process.env.HOST;

const swaggerAutogen = require("swagger-autogen");
const packageJson = require("./package.json");

const document = {
  info: {
    version: packageJson.version,
    title: packageJson.name,
    description: packageJson.description,
    termsOfService: "https://ibrahimseckin-portfolio.vercel.app/",
    license: { name: packageJson.license },
    contact: { name: packageJson.author, email: "ibr.seckin@gmail.com" },
  },
  host: `${HOST}${process.env.NODE_ENV === "dev" ? ":" + PORT : ""}`,
  basePath: "/",
  schemes: ["https", "http"],
  consumes: ["application/json", "multipart/form-data"],
  produces: ["application/json"],
  securityDefinitions: {
    Token: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description:
        " Simple token authentication *  example: <b>Token ...tokenkey...</b>",
    },
    Bearer: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description:
        "Jwt token authentication *  example : <b>Bearer ...jwt tokenkey...</b>",
    },
  },
  security: [{ Token: [] }, { Bearer: [] }],
  definitions: {
    User: require("./src/models/userModel").User.schema.obj,
    Email: require("./src/models/emailModel").Email.schema.obj,
    Team: require("./src/models/teamModel").Team.schema.obj,
    Training: require("./src/models/trainingModel").Training.schema.obj,
    Blog: require("./src/models/blogModel").Blog.schema.obj,
    ContactInfo: require("./src/models/contactInfoModel").ContactInfo.schema.obj,
  },
};

const routes = ["./index.js"];
const outputFile = "./src/configs/swagger.json";

swaggerAutogen(outputFile, routes, document);
