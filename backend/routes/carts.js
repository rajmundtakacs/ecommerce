const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

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

// GET all carts for a user
router.get('/user/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const result = await getCartsByUserId(user_id);
        res.json(result.rows);
    } catch (err) {
        logger.error(`Error fetching cart(s) for user_id=${req.params.user_id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error fetching cart(s)');
    }
});

// GET a cart by id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getCartById(id);

        if (!result.rows.length) {
            logger.warn(`Cart id=${id} not found`);
            return res.status(404).json({ error: 'Cart not found' });
        }

        logger.info(`Fetched cart id=${id}`);
        res.json(result.rows[0]);
    } catch (err) {
        logger.error(`Error fetching cart id=${req.params.id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error fetching the cart');
    }
});

// DELETE a cart by id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteCart(id);
        logger.info(`Deleted cart id=${id}`);
        res.status(200).send(`Cart with ID ${id} deleted`);
    } catch (err) {
        logger.error(`Error deleting cart id=${req.params.id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error deleting cart');
    }
});

// ** CART_ITEMS ROUTES **

// GET all items in a cart
router.get('/:cart_id/items', async (req, res) => {
    try {
        const { cart_id } = req.params;
        const result = await getCartItems(cart_id);
        logger.info(`Fetched items for cart_id=${cart_id}`);
        res.json(result.rows);
    } catch (err) {
        logger.error(`Error fetching items for cart_id=${req.params.cart_id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error fetching cart items');
    }
});

// POST - add or update item in current user's cart
router.post('/items', async (req, res) => {
    console.log('>>> REQ.USER in /carts/items:', req.user);
    try {
        const userId = req.user?.id;  // from the session
        if (!userId) {
            logger.warn(`Unauthorized add to cart attempt`);
            return res.status(401).json({ error: "Not logged in" });
        }

        // check if user already has a cart
        let cartResult = await getCartsByUserId(userId);
        if (cartResult.rows.length === 0) {
            cartResult = await createCart(userId);
            logger.info(`Created new cart for user_id=${userId}`);
        }
        const cartId = cartResult.rows[0].id;

        // add or update the item
        const { product_id, quantity } = req.body;
        const result = await addOrUpdateCartItem(cartId, product_id, quantity);
        logger.info(`User ${userId} added/updated product ${product_id} in cart ${cartId}`);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        logger.error(`Error adding/updating item for user ${req.user?.id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error adding or updating item');
    }
});


// PUT - update the quantity of an item in the cart
router.put('/:cart_id/items/:product_id', async (req, res) => {
    try {
        const { cart_id, product_id } = req.params;
        const { quantity } = req.body;
        const result = await updateCartItemQuantity(cart_id, product_id, quantity);
        logger.info(`Updated quantity=${quantity} for product_id=${product_id} in cart_id=${cart_id}`);
        res.json(result.rows[0]);
    } catch (err) {
        logger.error(`Error updating quantity for product_id=${req.params.product_id} in cart_id=${req.params.cart_id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error updating cart item quantity');
    }
});

// DELETE - Remove an item from the cart
router.delete('/:cart_id/items/:product_id', async (req, res) => {
    try {
        const { cart_id, product_id } = req.params;
        await removeCartItem(cart_id, product_id);
        logger.info(`Removed product_id=${product_id} from cart_id=${cart_id}`);
        res.status(200).send(`Item ${product_id} removed from cart ${cart_id}`);
    } catch (err) {
        logger.error(`Error removing product_id=${req.params.product_id} from cart_id=${req.params.cart_id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error removing item from cart');
    }
});

// DELETE - Remove all item from the cart
router.delete('/:cart_id/clear', async (req, res) => {
    try {
        const { cart_id } = req.params;
        await clearCart(cart_id);
        logger.info(`Cleared cart_id=${cart_id}`);
        res.status(200).send(`All items removed from cart ${cart_id}`);
    } catch (err) {
        logger.error(`Error clearing cart_id=${req.params.cart_id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error clearing cart');
    }
});

// POST - Checkout a cart
router.post('/checkout', async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        logger.warn(`Unauthorized checkout attempt`);
        return res.status(401).send('You must be logged in to checkout');
    }

    try {
        
        let cartResult = await getCartsByUserId(userId);
        if (cartResult.rows.length === 0) {
            logger.warn(`Checkout failed: no cart for user ${userId}`);
            return res.status(404).send('No cart found');
        }
        const cartId = cartResult.rows[0].id;

        const cartItemsResult = await getCartItems(cartId);
        const cartItems = cartItemsResult.rows;

        if (cartItems.length === 0) {
            logger.warn(`Checkout failed: cart_id=${cartId} is empty`);
            return res.status(400).send('Cart is empty');
        }

        const totalPrice = cartItems.reduce((acc, item) => acc + parseFloat(item.total_price), 0);
        const orderResult = await createOrder(userId, cartId, totalPrice);
        const order_id = orderResult.rows[0].id;

        await createOrderItems(order_id, cartItems);
        await clearCart(cartId);

        logger.info(`Checkout successful for user ${userId}, created order_id=${order_id}`);
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


