const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('../middleware/auth');
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
        res.json(result.rows);
    } catch (err) {
        console.err(err);
        res.status(500).send('Error fetching users');
    }
});

// GET a user by id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await getUserById(id);

        if (!result.rows.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching user');
    }
});

// POST - Register a new user
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Validation - checking if all fields are provided
    if(!name || !email || !password) {
        return res.status(400).json({ error: 'Invalid input data. Please provide a name, email and password.'});
    }

    try {

        // Hashing the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Calling the query function to add the user
        const result = await addUser(name, email, hashedPassword);

        const newUser = result.rows[0];

        // Return the created user object (do not include password in the response)
        res.status(201).json({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating user')
    }
});

// POST - User login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ error: info.message });

        req.login(user, (err) => {
            if (err) return next(err);
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
        return res.status(400).json({ error: 'Invalid input data. Name, email, and password are required.' });
    }

    try {
        const result = await updateUser(id, name, email, password);

        if (!result.rows.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating user');
    }
});

// DELETE a user by id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await deleteUser(id);

        if (!result.rows.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).send(`User with ID ${id} deleted`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting user')
    }
});

module.exports = router;