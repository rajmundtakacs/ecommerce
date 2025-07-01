const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      description: 'This is the API documentation for the E-commerce application.',
      version: '1.0.0',
      contact: {
        name: 'Rajmund Takács',
        email: 'rajmi@rajmi.com',
        url: 'http://rajmi.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Local server',
      },
    ],
  },
  apis: [path.join(__dirname, '../docs/*.yaml')],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

module.exports = swaggerDocs;
