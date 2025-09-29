require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('./middleware/auth');
const swaggerUI = require('swagger-ui-express');
const swaggerDocs = require('./utils/swagger');
const helmet = require('helmet');
const path = require('path');
const cors = require('cors');

const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/carts');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const stripeRoutes = require('./routes/stripe');

const app = express();
const PORT = 8000;

// Helmet security headers
app.use(helmet());

// CORS middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Setting up Swagger UI route
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use(express.json()); // Middleware for parsing JSON req bodies

// root
app.get('/', (req, res) => {
    res.redirect('/api-docs');
});

app.set('trust proxy', 1);

// Setup Express-session middleware to manage user sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: 'none'
    }
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
app.use('/auth', authRoutes);
app.use('/stripe', stripeRoutes);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});