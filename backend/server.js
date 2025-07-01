const express = require('express');
const session = require('express-session');
const passport = require('./middleware/auth');
const swaggerUI = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const app = express();
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/carts');
const orderRoutes = require('./routes/orders');
const PORT = 3000;
require('dotenv').config();

// Defining the OpenAPI spec path
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
          url: 'http://localhost:3000',
          description: 'Local server',
        },
      ],
    },
    // Point to the YAML file
    apis: ['./api.yaml'],
  };

// Initializing the swagger-jsdoc
const swaggerDocs = swaggerJSDoc(swaggerOptions);

// Setting up Swagger UI route
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use(express.json()); // Middleware for parsing JSON req bodies

// root
app.get('/', (req, res) => {
    res.send('Hello, this is an ecommerce server');
});

// Setup Express-session middleware to manage user sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport middleware (for authentication handling)
app.use(passport.initialize());

// Enable Passport middleware to use session-based authentication (combine the passport middleware and express-session)
app.use(passport.session());

// Attaching routes to the app
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/carts', cartRoutes);
app.use('/orders', orderRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});