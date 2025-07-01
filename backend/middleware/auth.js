const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { getUserByEmail, getUserById } = require('../queries/users');

passport.use(
    new LocalStrategy({ usernameField: 'email'}, async (email, password, done) => {
        try {

            // Checking if the email exists in the database
            const result = await getUserByEmail(email);
            if (!result.rows.length) {
                return done(null, false, {message: 'No user found'});
            }

            // Storing the queried user object for further use
            const user = result.rows[0];

            // Comparing hashed passwords
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Incorrect password' });
            }
            
            return done(null, user);
            
        } catch (err) {
            return done(err);
        }
    })
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await getUserById(id);
        done(null, user.rows[0]);
    } catch (err) {
        done(err);
    }
});

module.exports = passport;