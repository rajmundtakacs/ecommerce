const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { 
    getUsers,  
    getUserById, 
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
        res.status(500).json({ error: 'Error updating user' });
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
        res.status(500).json({ error: 'Error deleting user' });
    }
});

module.exports = router;