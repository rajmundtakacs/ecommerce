const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const {
    getOrders,
    getOrdersByUserId,
    getOrderById,
    getOrderItems
} = require('../queries/orders');

// GET all orders
router.get('/', async (req, res) => {
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
router.get('/user/:user_id', async (req, res) => {
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
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getOrderById(id);

        if (!result.rows.length) {
            logger.warn(`Order id=${id} not found`);
            return res.status(404).json({ error: 'Order not found' });
        }

        logger.info(`Fetched order id=${id}`);
        res.json(result.rows[0]);
    } catch (err) {
                logger.error(`Error fetching order id=${id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error fetching order');
    }
});

// GET all items for a specific order
router.get('/:id/items', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getOrderItems(id);
        logger.info(`Fetched items for order id=${id}`);
        res.json(result.rows);
    } catch (err) {
        logger.error(`Error fetching items for order id=${req.params.id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error fetching items for the order');
    }
});

module.exports = router;