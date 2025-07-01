const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { getUserByEmail, getUserById } = require('../queries/users');
const logger = require('../utils/logger');


passport.use(
    new LocalStrategy({ usernameField: 'email'}, async (email, password, done) => {
        try {

            // Checking if the email exists in the database
            const result = await getUserByEmail(email);
            if (!result.rows.length) {
                return done(null, false, {message: 'Invalid email or password'});
            }

            // Storing the queried user object for further use
            const user = result.rows[0];

            // Comparing hashed passwords
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return done(null, false, { message: 'Invalid email or password' });
            }
            
            return done(null, user);
            
        } catch (err) {
            logger.error('Auth error:', err);
            return done(err);
        }
    })
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
    try {
        const userResult = await getUserById(id);
        if (!userResult.rows.length) {
            return done(null, false);
        }

        done(null, userResult.rows[0]);
    } catch (err) {
        logger.error('Deserialize error:', err);
        done(err);
    }
});

module.exports = passport;