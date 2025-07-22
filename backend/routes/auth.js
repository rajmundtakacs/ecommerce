const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('../middleware/auth');
const logger = require('../utils/logger');
const ensureAuthenticated = require('../middleware/ensureAuthenticated');

const {
    addUser,
    getUserByGoogleId,
    createUserWithGoogle,
    getUserByFacebookId,
    createUserWithFacebook
} = require('../queries/auth');

// POST - Register a new user
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Validation - checking if all fields are provided
    if(!username || !email || !password) {
        logger.warn(`Missing fields in register request`);
        return res.status(400).json({ error: 'Invalid input data. Please provide a name, email and password.'});
    }

    try {

        // Hashing the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Calling the query function to add the user
        const result = await addUser(username, email, hashedPassword);

        const newUser = result.rows[0];

        // Return the created user object (do not include password in the response)
        logger.info(`Registered new user email=${email}`);
        res.status(201).json({
            id: newUser.id,
            username: newUser.username,
            email: newUser.email
        });

    } catch (err) {
        logger.error(`Error creating user email=${email}: ${err.message}`, { stack: err.stack });
        res.status(500).json({ error: 'Error creating user' });
    }
});

// POST - User login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            logger.error(`Error during authentication: ${err.message}`, { stack: err.stack });
            return next(err);
        };

        if (!user) {
            logger.warn(`Failed login attempt for email=${req.body.email}`);
            return res.status(401).json({ error: info.message })
        };

        req.login(user, (err) => {
            if (err) {
                logger.error(`Error establishing session for user id=${user.id}: ${err.message}`, { stack: err.stack });
                return next(err)
            };
            logger.info(`User id=${user.id} logged in`);
            return res.json({ id: user.id, username: user.name, email: user.email });
        });
    }) (req, res, next);
});

// POST - Login or register with Google
router.post('/google', async (req, res, next) => {
    const { googleId, username, email } = req.body;

    if (!googleId || !username || !email) {
        logger.warn('Missing fields in Google auth request');
        return res.status(400).json({ error: 'Invalid input data. Please provide googleId, username and email.'});
    }

    try {
        let result = await getUserByGoogleId(googleId);
        let user = result.rows[0];

        if (!user) {
            result = await createUserWithGoogle({ googleId, username, email });
            user = result.rows[0];
            logger.info(`Created new user with Google id=${user.id}`);
        } else {
            logger.info(`Existing Google user login id=${user.id}`);
        }

        // Serialize
        req.login(user, (err) => {
            if (err) {
                logger.error(`Session login error for Google user id=${user.id}: ${err.message}`);
                return next(err);
            }
            return res.json({
                id: user.id,
                username: user.username,
                email: user.email
            });
        });
    } catch (err) {
        logger.error(`Error with Google login: ${err.message}`, { stack: err.stack });
        res.status(500).json({ error: 'Error with Google authentication' });
    }
});


// POST - Login or register with Facebook
router.post('/facebook', async (req, res) => {
    const { facebookId, username } = req.body;

    if (!facebookId || !username) {
        logger.warn(`Missing fields in Facebook auth request`);
        return res.status(400).json({ error: 'Invalid input data. Please provide facebookId and username.'});
    }

    try {
        // Try to find existing user
        let result = await getUserByFacebookId(facebookId);
        let user = result.rows[0];

        // If not found, create
        if (!user) {
            result = await createUserWithFacebook({ facebookId, username });
            user = result.rows[0];
            logger.info(`Created new user with Facebook id=${user.id}`);
        } else {
            logger.info(`Existing Facebook user login id=${user.id}`);
        }

        // Serialize
        req.login(user, (err) => {
            if (err) {
                logger.error(`Session login error for Facebook user id=${user.id}: ${err.message}`);
                return next(err);
            }
            return res.json({
                id: user.id,
                username: user.username
            });
        });

    } catch (err) {
        logger.error(`Error with Facebook login: ${err.message}`, { stack: err.stack });
        res.status(500).json({ error: 'Error with Facebook authentication' });
    }
});

// POST - Logout
router.post('/logout', ensureAuthenticated, (req, res, next) => {
    req.logout(function(err) {
        if (err) {
            logger.error('Logout error:', err);
            return next(err);
        }

        req.session.destroy((sessionErr) => {
            if (sessionErr) {
                logger.error(`Session destroy error: ${sessionErr.message}`, { stack: sessionErr.stack });

                return next(sessionErr);
            }

            res.clearCookie('connect.sid');
            logger.info(`User logged out. IP: ${req.ip}, user=${req.user?.email || 'unknown'}`);
            return res.status(200).json({ message: 'Logged out successfully' });
        });
    });
});


module.exports = router;