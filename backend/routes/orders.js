const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const authorizeOrderAccess = require('../middleware/authorizeOrderAccess');

const {
    getOrders,
    getOrdersByUserId,
    getOrderById,
    getOrderItems
} = require('../queries/orders');

// GET - Orders for current session user
router.get('/me', ensureAuthenticated, async (req, res) => {
    try {
      const result = await getOrdersByUserId(req.user.id);
      res.json(result.rows);
    } catch (err) {
      logger.error(`Failed to fetch orders for user ${req.user.id}: ${err.message}`);
      res.status(500).send('Failed to fetch orders');
    }
});

// GET all orders
router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const result = await getOrders();
        logger.info(`Fetched all orders`);
        res.json(result.rows);
    } catch (err) {
        logger.error(`Error fetching orders: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error fetching orders');
    }
});

// GET all orders by user_id
router.get('/user/:user_id', ensureAuthenticated, async (req, res) => {
    try {
        const { user_id } = req.params;
        const result = await getOrdersByUserId(user_id);
        logger.info(`Fetched orders for user_id=${user_id}`);
        res.json(result.rows);
    } catch (err) {
        logger.error(`Error fetching orders for user_id=${req.params.user_id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error fetching orders');
    }
});

// GET a specific order by id
router.get('/:id', ensureAuthenticated, authorizeOrderAccess, (req, res) => {
    res.json(req.order);
});

// GET all items for a specific order
router.get('/:id/items', ensureAuthenticated, authorizeOrderAccess, async (req, res) => {
    try {
      const result = await getOrderItems(req.params.id);
      res.json(result.rows);
    } catch (err) {
      logger.error(`Error fetching items for order id=${req.params.id}: ${err.message}`, { stack: err.stack });
      res.status(500).send('Error fetching items for the order');
    }
});

module.exports = router;