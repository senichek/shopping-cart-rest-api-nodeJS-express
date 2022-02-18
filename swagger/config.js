swaggerJsdoc = require("swagger-jsdoc"),
swaggerUi = require("swagger-ui-express");
// https://javascript.plainenglish.io/how-to-implement-and-use-swagger-in-nodejs-d0b95e765245
const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "REST API for Online Store project",
        version: "0.1.0",
        description:
          "CRUD operations for USER and ITEM (Node.js, Express)",
        
      },
      servers: [
        {
          url: "http://localhost:3001/",
        }
      ],
    },
    apis: ["./routes/*.js"],
  };
  
  const specs = swaggerJsdoc(options);

  const docsURL = "/api-docs";
  const swaggerServe = swaggerUi.serve;
  const swaggerSetup = swaggerUi.setup(specs, { explorer: true });

  /**
 * @swagger
 *  tags:
 *    name: Items
 *    description: Operations with the Items
 */
  
  module.exports = {
      docsURL,
      swaggerServe,
      swaggerSetup
  }