const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const authorizeCartAccess = require('../middleware/authorizeCartAccess');

const {
    getCarts,
    getCartsByUserId,
    getCartById,
    createCart,
    deleteCart
} = require('../queries/carts');

const {
    getCartItems,
    addOrUpdateCartItem,
    updateCartItemQuantity,
    removeCartItem,
    clearCart
} = require('../queries/cart_items');

const { createOrder, createOrderItems } = require('../queries/orders');

// ** CART ROUTES **

// GET all carts
router.get('/', async (req, res) => {
    try {
        const result = await getCarts();
        res.json(result.rows);
    } catch (err) {
        logger.error(`Error fetching all carts: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error fetching carts');
    }
});

// GET all carts for the currently logged in user
router.get('/current', ensureAuthenticated, async (req, res) => {
    try {
        const result = await getCartsByUserId(req.user.id);
        res.json(result.rows);
    } catch (err) {
        logger.error(`Error fetching cart(s) for user_id=${req.user.id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error fetching cart(s)');
    }
});

// GET a cart by id
router.get('/:id', ensureAuthenticated, authorizeCartAccess, async (req, res) => {
    res.json(req.cart);
});

// DELETE a cart by id
router.delete('/:id', ensureAuthenticated, authorizeCartAccess, async (req, res) => {
    const { id } = req.params;
    try {
        await deleteCart(id);
        res.status(200).send(`Cart with ID ${id} deleted`);
    } catch (err) {
        logger.error(`Error deleting cart id=${id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error deleting cart');
    }
});

// GET all items in a cart
router.get('/:cart_id/items', ensureAuthenticated, authorizeCartAccess, async (req, res) => {
    try {
        const { cart_id } = req.params;
        const result = await getCartItems(cart_id);
        res.json(result.rows);
    } catch (err) {
        logger.error(`Error fetching items for cart_id=${cart_id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error fetching cart items');
    }
});

// POST - add or update item in current user's cart
router.post('/items', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        let cartResult = await getCartsByUserId(userId);
        if (cartResult.rows.length === 0) {
            cartResult = await createCart(userId);
        }
        const cartId = cartResult.rows[0].id;
        const { product_id, quantity } = req.body;
        const result = await addOrUpdateCartItem(cartId, product_id, quantity);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        logger.error(`Error adding/updating item for user ${req.user.id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error adding or updating item');
    }
});

// PUT - update the quantity of an item in the cart
router.put('/:cart_id/items/:product_id', ensureAuthenticated, authorizeCartAccess, async (req, res) => {
    try {
        const { cart_id, product_id } = req.params;
        const { quantity } = req.body;
        const result = await updateCartItemQuantity(cart_id, product_id, quantity);
        res.json(result.rows[0]);
    } catch (err) {
        logger.error(`Error updating quantity for product_id=${product_id} in cart_id=${cart_id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error updating cart item quantity');
    }
});

// DELETE - Remove an item from the cart
router.delete('/:cart_id/items/:product_id', ensureAuthenticated, authorizeCartAccess, async (req, res) => {
    try {
        const { cart_id, product_id } = req.params;
        await removeCartItem(cart_id, product_id);
        res.status(200).send(`Item ${product_id} removed from cart ${cart_id}`);
    } catch (err) {
        logger.error(`Error removing product_id=${product_id} from cart_id=${cart_id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error removing item from cart');
    }
});

// DELETE - Remove all items from the cart
router.delete('/:cart_id/clear', ensureAuthenticated, authorizeCartAccess, async (req, res) => {
    try {
        const { cart_id } = req.params;
        await clearCart(cart_id);
        res.status(200).send(`All items removed from cart ${cart_id}`);
    } catch (err) {
        logger.error(`Error clearing cart_id=${cart_id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error clearing cart');
    }
});

// POST - Checkout a cart
router.post('/checkout', ensureAuthenticated, async (req, res) => {
    const userId = req.user.id;
    try {
        let cartResult = await getCartsByUserId(userId);
        if (cartResult.rows.length === 0) {
            return res.status(404).send('No cart found');
        }
        const cartId = cartResult.rows[0].id;
        const cartItemsResult = await getCartItems(cartId);
        const cartItems = cartItemsResult.rows;
        if (cartItems.length === 0) {
            return res.status(400).send('Cart is empty');
        }
        const totalPrice = cartItems.reduce((acc, item) => acc + parseFloat(item.total_price), 0);
        const orderResult = await createOrder(userId, cartId, totalPrice);
        const order_id = orderResult.rows[0].id;
        await createOrderItems(order_id, cartItems);
        await clearCart(cartId);
        res.status(201).json({
            message: 'Checkout successful!',
            order: orderResult.rows[0]
        });
    } catch (err) {
        logger.error(`Error processing checkout for user ${userId}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error processing checkout');
    }
});

module.exports = router;
