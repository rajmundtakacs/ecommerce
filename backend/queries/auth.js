const { query } = require('../db');

// Get user by email
const getUserByEmail = (email) => {
    return query ('SELECT * FROM users WHERE email = $1', [email]);
}

// Add a new user
const addUser = (name, email, password) => {
    return query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
        [name, email, password]
    );
};

// Get user by Google ID
const getUserByGoogleId = (googleId) => {
    return query(
        'SELECT * FROM users WHERE google_id = $1',
        [googleId]
    );
};

// Create user by with Google
const createUserWithGoogle = ({ googleId, username, email }) => {
    return query(
        'INSERT INTO users (google_id, name, email) VALUES ($1, $2, $3) RETURNING *',
        [googleId, username, email]
    );
};

// Get user by Facebook ID
const getUserByFacebookId = (facebookId) => {
    return query(
        'SELECT * FROM users WHERE facebook_id = $1',
        [facebookId]
    );
};

// Create user by with Facebook
const createUserWithFacebook = ({ facebookId, username, email }) => {
    return query(
        'INSERT INTO users (facebook_id, name, email) VALUES ($1, $2, $3) RETURNING *',
        [facebookId, username, email]
    );
};



module.exports = {
    getUserByEmail,
    addUser,
    getUserByGoogleId,
    createUserWithGoogle,
    getUserByFacebookId,
    createUserWithFacebook
};