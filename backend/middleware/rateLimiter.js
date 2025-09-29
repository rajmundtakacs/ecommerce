const rateLimit = require('express-rate-limit');

const loginRateLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 5,              
  message: 'Túl sok próbálkozás, próbáld újra 1 perc múlva'
});

module.exports = { loginRateLimiter };
