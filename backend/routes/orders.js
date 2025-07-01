const express = require('express');
const router = express.Router();
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
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching orders');
    }
});

// GET all orders by user_id
router.get('/user/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const result = await getOrdersByUserId(user_id);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching orders');
    }
});

// GET a specific order by id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getOrderById(id);

        if (!result.rows.length) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching order');
    }
});

// GET all items for a specific order
router.get('/:id/items', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getOrderItems(id);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching items for the order');
    }
});

module.exports = router;