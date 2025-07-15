require('dotenv').config();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcrypt');
const {
    getUserByEmail,
    getUserById,
    getUserByGoogleId,
    createUserWithGoogle,
    getUserByFacebookId,
    createUserWithFacebook
} = require('../queries/users');
const logger = require('../utils/logger');

// Local strategy
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

// Google strategy
passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const existingUser = await getUserByGoogleId(profile.id);
            if (existingUser.rows.length) {
                user.id = user.id || user.ID || user.google_id;
                console.log('>> Done with GoogleStrategy user:', existingUser.rows[0]);
                return done(null, existingUser.rows[0]);
            }

            const newUser = await createUserWithGoogle({
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails?.[0]?.value || null
            });

            console.log('>> Done with GoogleStrategy new user:', newUser.rows[0]);
            return done(null, newUser.rows[0]);
        } catch (err) {
            logger.error('google auth error:', err);
            return done(err);
        }
    })
);

// Facebook strategy
passport.use(
    new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.BASE_URL}/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'emails']
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const existingUser = await getUserByFacebookId(profile.id);
            if (existingUser.rows.length) {
                return done(null, existingUser.rows[0]);
            }

            const newUser = await createUserWithFacebook({
                facebookId: profile.id,
                username: profile.displayName,
                email: profile.emails?.[0]?.value || null
            });
            return done(null, newUser.rows[0]);
        } catch (err) {
            logger.error('Facebook auth error:', err);
            return done(err);
        }
    })
);

// Serialize / Deserialize
passport.serializeUser((user, done) => {
    console.log('Serializing user:', user);
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    console.log('>> DESERIALIZING user id from session:', id);
    try {
        const userResult = await getUserById(id);
        console.log('>> Found user from DB:', userResult.rows[0]);
        if (!userResult.rows.length) {
            console.log('>> NO USER FOUND IN DB');
            return done(null, false);
        }
        done(null, userResult.rows[0]);
    } catch (err) {
        console.log('>> ERROR IN DESERIALIZE:', err);
        done(err);
    }
});


module.exports = passport;