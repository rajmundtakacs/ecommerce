const { query } = require('../db');

// Get all users
const getUsers = () => {
    return query('SELECT * FROM users')
}

// Get user by id
const getUserById = (id) => {
    return query ('SELECT * FROM users WHERE id = $1', [id]);
};

// Get user by email
const getUserByEmail = (email) => {
    return query ('SELECT * FROM users WHERE email = $1', [email]);
}

// Update user info
const updateUser = (id, username, email, password) => {
    return query(
        'UPDATE users SET username = $1,email = $2, password = $3 WHERE id = $4 RETURNING *',
        [username, email, password, id]
    );
};

// Delete a user
const deleteUser = (id) => {
    return query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
};

module.exports = {
    getUsers,
    getUserById,
    getUserByEmail,
    updateUser,
    deleteUser
};