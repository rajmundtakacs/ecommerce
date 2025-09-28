# PERN E-Commerce App

A full-stack **PERN application** (PostgreSQL, Express, React, Node.js) that provides an e-commerce platform with product browsing, cart management, secure checkout, and Stripe integration.  
The app supports both local authentication (email/password) and social login (Google, Facebook).

---

Payments are integrated with **Stripe Sandbox mode**.  
Use test cards like `4242 4242 4242 4242` (any future expiration date, CVC: 123) to simulate purchases.

## Tech Stack

### Frontend
- [React 19](https://react.dev/) (Create React App)
- [React Router DOM 7](https://reactrouter.com/)
- [Tailwind CSS 3](https://tailwindcss.com/) for responsive UI
- [Stripe.js](https://stripe.com/docs/js) & [React Stripe](https://stripe.com/docs/stripe-js/react) – payment integration

### Backend
- [Node.js](https://nodejs.org/) + [Express 4](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/) database
- **Authentication & Sessions:**  
  - Passport (local, Google, Facebook strategies)  
  - bcrypt for password hashing  
  - express-session
- **Security:** Helmet, CORS, express-rate-limit
- **Payments:** Stripe server-side API
- **API Documentation:** Swagger (swagger-jsdoc + swagger-ui-express)
- **Logging:** Winston

---

## Features
- **User Authentication** – Local, Google, and Facebook login  
- **Shopping Cart** – Add/remove products from a cart  
- **Stripe Checkout** – Secure payment flow with test card support  
- **Order Management** – Store order details in PostgreSQL  
- **API Documentation** – Swagger UI available in development mode  
- **Responsive Design** – Optimized for both desktop and mobile  

---

## Installation & Setup

1. Clone the repository
```bash
git clone https://github.com/rajmundtakacs/ecommerce.git
cd ecommerce
```

2. Install backend
```bash
cd backend
npm install
```

3. Install frontend (in a new terminal window)
```bash
cd frontend
npm install
```

4. Create a `.env` file in the backend root.  
Use the provided `.env.example` in the /backend folder as a reference and replace the placeholders with your actual credentials.

5. Create a `.env` file in the frontend root.  
Use the provided `.env.example` in the /frontend folder as a reference and replace the placeholders with your actual credentials.

6. Make sure PostgreSQL is running and create a new database:
```bash
CREATE DATABASE ecommerce;
```

7. Update .env with your PostgreSQL user, password, and database name.

8. Start the backend:
```bash
npm run dev;
```
The backend will run at http://localhost:8000

9.  Start the frontend:
```bash
npm start;
```
The frontend will run at http://localhost:3000


## Deployment

**Frontend**

Build a production bundle with:

```bash
npm run build
```

The build/ folder can be deployed to any static host (GitHub Pages, Netlify, Vercel, etc).

Make sure REACT_APP_API_URL in the frontend .env points to your deployed backend URL.

**Backend**

Deploy to Render, Railway, Fly.io, or Heroku.

Configure environment variables in your hosting provider:

```bash
DB credentials (DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT)

SESSION_SECRET

STRIPE_SECRET_KEY

OAuth (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)

FRONTEND_URL (your deployed frontend)

BASE_URL (backend URL)
```

**Database**

Use a managed PostgreSQL service (Supabase, Render, Neon.tech, Railway, etc.) in production.

Update your .env with the production connection string.

## Project Structure

```text
backend/
  docs/              # API documentation (Swagger configs, schema diagrams, etc.)
  middleware/        # Express middlewares (auth, error handling, etc.)
  queries/           # Database queries
  routes/            # Express routes
  uploads/           # File uploads (images, assets)
  utils/             # Utility functions/helpers
  db.js              # Database connection setup
  server.js          # Express server entry point

frontend/
  src/
    components/      # Reusable UI components
    hooks/           # Custom React hooks
    pages/           # Route-based pages
    App.js           # Main React component
    index.js         # Entry point

```

## Development Notes

- Social login requires valid Google and Facebook app credentials.  
- Stripe works only in **test mode** until you provide live keys.   
- Tailwind configuration (`tailwind.config.js`) is included and can be extended for custom styling.  
- Swagger docs are available at `/api/docs` when the backend is running.

## Limitations

- Only **test payments** are available (Stripe Sandbox mode).   
- Free-tier PostgreSQL hosting (Supabase, Railway, Neon.tech, etc.) may have performance or storage limits.

## License

This project is for learning purposes.
Feel free to fork and adapt for your own use.
