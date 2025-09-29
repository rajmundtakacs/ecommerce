const logger = require('../utils/logger');

function ensureAuthenticated(req, res, next) {
    if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) {
        return next();
    }

    logger.warn('Unauthorized access attempt detected');
    res.status(401).json({ message: 'Unauthorized. Please log in.' });
}

module.exports = ensureAuthenticated;
