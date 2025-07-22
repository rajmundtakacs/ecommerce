const { getCartById } = require('../queries/carts');
const logger = require('../utils/logger');

async function authorizeCartAccess(req, res, next) {
  const cartId = req.params.cart_id || req.params.id;

  try {
    const cartResult = await getCartById(cartId);
    const cart = cartResult.rows[0];

    if (!cart) {
      logger.warn(`Cart not found: id=${cartId}`);
      return res.status(404).json({ error: 'Cart not found' });
    }

    if (cart.user_id !== req.user.id) {
      logger.warn(`Access denied: user ${req.user.id} tried to access cart ${cartId}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    req.cart = cart; // opcionálisan továbbvihető
    next();
  } catch (err) {
    logger.error(`Authorization error for cart ${cartId}: ${err.message}`, { stack: err.stack });
    res.status(500).json({ error: 'Internal server error during authorization' });
  }
}

module.exports = authorizeCartAccess;
