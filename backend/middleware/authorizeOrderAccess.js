const { getOrderById } = require('../queries/orders');
const logger = require('../utils/logger');

async function authorizeOrderAccess(req, res, next) {
  const orderId = req.params.id;

  // Biztonsági ellenőrzés: csak pozitív szám
  if (!/^\d+$/.test(orderId)) {
    logger.warn(`Invalid order ID format: ${orderId}`);
    return res.status(400).json({ error: 'Invalid order ID format' });
  }

  try {
    const { rows } = await getOrderById(orderId);
    const order = rows[0];

    if (!order) {
      logger.warn(`Order not found: id=${orderId}`);
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.user_id !== req.user.id) {
      logger.warn(`Access denied: user ${req.user.id} tried to access order ${orderId}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    req.order = order;
    next();
  } catch (err) {
    logger.error(`Authorization error for order ${orderId}: ${err.message}`, { stack: err.stack });
    res.status(500).json({ error: 'Internal server error during authorization' });
  }
}

module.exports = authorizeOrderAccess;
