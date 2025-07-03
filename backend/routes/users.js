const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('../middleware/auth');
const logger = require('../utils/logger');
const { 
    getUsers, 
    addUser, 
    getUserById, 
    getUserByEmail, 
    updateUser, 
    deleteUser 
} = require('../queries/users');

// GET all users
router.get('/', async (req, res) => {
    try {
        const result = await getUsers();
        logger.info(`Fetched all users`);
        res.json(result.rows);
    } catch (err) {
        logger.error(`Error fetching users: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error fetching users');
    }
});

// GET a user by id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await getUserById(id);

        if (!result.rows.length) {
            logger.warn(`User id=${id} not found`);
            return res.status(404).json({ error: 'User not found' });
        }

        logger.info(`Fetched user id=${id}`);
        res.json(result.rows[0]);
    } catch (err) {
        logger.error(`Error fetching user id=${id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error fetching user');
    }
});

// POST - Register a new user
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Validation - checking if all fields are provided
    if(!name || !email || !password) {
        logger.warn(`Missing fields in register request`);
        return res.status(400).json({ error: 'Invalid input data. Please provide a name, email and password.'});
    }

    try {

        // Hashing the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Calling the query function to add the user
        const result = await addUser(name, email, hashedPassword);

        const newUser = result.rows[0];

        // Return the created user object (do not include password in the response)
        logger.info(`Registered new user email=${email}`);
        res.status(201).json({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        });

    } catch (err) {
        logger.error(`Error creating user email=${email}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error creating user')
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
            return res.json({ id: user.id, name: user.name, email: user.email });
        });
    }) (req, res, next);
});

// PUT - Update a user by id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    // Validate input data
    if (!name || !email || !password) {
        logger.warn(`Missing fields in update user request for id=${id}`);
        return res.status(400).json({ error: 'Invalid input data. Name, email, and password are required.' });
    }

    try {
        const result = await updateUser(id, name, email, password);

        if (!result.rows.length) {
            logger.warn(`Update failed: user id=${id} not found`);
            return res.status(404).json({ error: 'User not found' });
        }

        const updatedUser = result.rows[0];
        logger.info(`Updated user id=${id}`);
        res.json({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email
        });

    } catch (err) {
        logger.error(`Error updating user id=${id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error updating user');
    }
});

// DELETE a user by id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await deleteUser(id);

        if (!result.rows.length) {
            logger.warn(`Delete failed: user id=${id} not found`);
            return res.status(404).json({ error: 'User not found' });
        }

        logger.info(`Deleted user id=${id}`);
        res.status(200).send(`User with ID ${id} deleted`);
    } catch (err) {
        logger.error(`Error deleting user id=${id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error deleting user')
    }
});

module.exports = router;