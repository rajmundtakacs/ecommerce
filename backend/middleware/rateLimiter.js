const rateLimit = require('express-rate-limit');

const loginRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 perc
  max: 5,              // max 5 request per IP
  message: 'Túl sok próbálkozás, próbáld újra 1 perc múlva'
});

module.exports = { loginRateLimiter };
