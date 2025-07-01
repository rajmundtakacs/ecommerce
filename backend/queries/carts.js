const { query } = require('../db');


// Get all carts
const getCarts = () => {
    return query('SELECT * FROM carts ');
};

// Get all carts for a user
const getCartsByUserId = (user_id) => {
    return query('SELECT * FROM carts WHERE user_id = $1', [user_id]);
};

const getCartById = async (id) => {
    return query(
        `SELECT c.id, c.user_id, 
                COALESCE(SUM(ci.total_price), 0) AS total_price
         FROM carts c
         LEFT JOIN cart_items ci ON c.id = ci.cart_id
         WHERE c.id = $1
         GROUP BY c.id, c.user_id;`,
        [id]
    );
};

// Create a new cart for a user
const createCart = (user_id) => {
    return query('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [user_id]);
};

// Delete a cart
const deleteCart = (id) => {
    return query('DELETE FROM carts WHERE id =$1 RETURNING *', [id]);
};

module.exports = {
    getCarts,
    getCartsByUserId,
    getCartById,
    createCart,
    deleteCart
}
