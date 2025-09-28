const { query } = require('../db');

// Get all orders
const getOrders = async () => {
    return query('SELECT * FROM orders');
};

// Get all orders by user_id
const getOrdersByUserId = async (user_id) => {
    return query('SELECT * FROM orders WHERE user_id = $1', [user_id]);
};

// Get a specific order by order_id
const getOrderById = async (id) => {
    return query('SELECT * FROM orders WHERE id = $1', [id]);
};

// Get all items for a specific order
const getOrderItems = async (id) => {
    return query(
        `SELECT oi.*, p.name, p.description, p.image
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1`,
        [id]
    );
};

// Create a new order
const createOrder = (user_id, cart_id, total_price) => {
    return query (
        'INSERT INTO orders (user_id, cart_id, total_price) VALUES ($1, $2, $3) RETURNING *',
        [user_id, cart_id, total_price]
    );
};

// Create order items (moving items from cart to order_items table)
const createOrderItems = async (order_id, cartItems) => {
    try {
        const insertItems = await Promise.all(
            cartItems.map(async (item) => {
                const { product_id, quantity, total_price } = item;

                const result = await query(
                    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
                    [order_id, product_id, quantity, total_price]
                );

                return result.rows[0]; // Return the inserted item
            })
        );

        // Return all inserted items
        return insertItems;

    } catch (err) {
        console.error('Error inserting order items:', err);
        throw err; 
    }
};

module.exports = {
    getOrders,
    getOrdersByUserId,
    getOrderById,
    getOrderItems,
    createOrder,
    createOrderItems
};
