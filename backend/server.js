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
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 8000;

// Biztonsági headerek
app.use(helmet());

// Engedélyezett frontok
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_STAGING,
  'http://localhost:3000',
].filter(Boolean);

// Diagnosztikai log
app.use((req, _res, next) => {
  console.log(`[req] ${req.method} ${req.originalUrl} | origin:${req.headers.origin} | cookies:${req.headers.cookie ? 'y' : 'n'}`);
  next();
});

// CORS (origin callback + preflight)
app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.options('*', cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS preflight blocked'));
  },
  credentials: true,
}));

// Swagger
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// JSON parser
app.use(express.json());

// Root → Swagger
app.get('/', (req, res) => res.redirect('/api-docs'));

// Proxy bizalom a secure cookie-hoz
app.set('trust proxy', 1);

// Session cookie (env-alapú)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProd,
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
  },
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// API route-ok
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/carts', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/auth', authRoutes);
app.use('/stripe', stripeRoutes);

// Statikus képek (uploads)
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Start
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT} (NODE_ENV=${process.env.NODE_ENV})`);
});

