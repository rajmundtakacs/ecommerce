const { query } = require('../db');

// Get all items in a cart, joined with product details
const getCartItems = (cart_id) => {
    return query(`
        SELECT 
            ci.cart_id,
            ci.product_id,
            ci.quantity,
            ci.total_price,
            p.name,
            p.image,
            p.price
        FROM 
            cart_items ci
        JOIN 
            products p ON ci.product_id = p.id
        WHERE 
            ci.cart_id = $1
    `, [cart_id]);
};


// Adding or updating a cart item
const addOrUpdateCartItem = async (cart_id, product_id, quantity) => {

    // Fetching the actual price from the products table
    const productResult = await query ('SELECT price FROM products WHERE id = $1', [product_id]);

    // Check if the product exists
    if (productResult.rows.length === 0) {
        throw new Error('Product not found');
    }

    const productPrice = productResult.rows[0].price;

    // Checking that the item is already in cart. if it is, UPDATE quantity and total prize
    const existingItem = await query(
        'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cart_id, product_id]
    );

    // Calculate the total price based on quantity
    const totalPrice = productPrice * quantity;
    
    if (existingItem.rows.length > 0) {
        // If item exists, update quantity and total price
        const existingQuantity = existingItem.rows[0].quantity;
        const newQuantity = existingQuantity + quantity;
        const updatedTotalPrice = productPrice * newQuantity; // Recalculate total prize for the new quantity
        
        return query(
            'UPDATE cart_items SET quantity = $1, total_price = $2 WHERE cart_id = $3 AND product_id = $4 RETURNING *',
            [newQuantity, updatedTotalPrice, cart_id, product_id]
        )
    // if it isn't, INSERT new row
    } else {
        return query (
            'INSERT INTO cart_items (cart_id, product_id, quantity, total_price) VALUES ($1, $2, $3, $4) RETURNING *',
            [cart_id, product_id, quantity, totalPrice]
        );
    }
};

// Update item quantity
const updateCartItemQuantity = (cart_id, product_id, quantity) => {
    return query(
        'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3 RETURNING *',
        [quantity, cart_id, product_id]
    );
};

// Remove an item from the cart
const removeCartItem = (cart_id, product_id) => {
    return query(
        'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2 RETURNING *',
        [cart_id, product_id]
    );
};

// Clear all items from a cart
const clearCart = (cart_id) => {
    return query('DELETE FROM cart_items WHERE cart_id = $1 RETURNING *', [cart_id]);
};

module.exports = {
    getCartItems,
    addOrUpdateCartItem,
    updateCartItemQuantity,
    removeCartItem,
    clearCart
}