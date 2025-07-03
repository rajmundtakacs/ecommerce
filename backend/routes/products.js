const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const {
    getProducts,
    getProductById,
    getProductByCategory,
    addProduct,
    updateProduct,
    deleteProduct
} = require('../queries/products');

// GET all products
router.get('/', async (req, res) => {
    try {
        const result = await getProducts();
        logger.info(`Fetched all products`);
        res.json(result.rows);
    } catch (err) {
        logger.error(`Error fetching products: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error fetching products');
    }
});

// GET a product by id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await getProductById(id);

        // Check if the product exists
        if (result.rows.length === 0) {
            logger.warn(`Product id=${id} not found`);
            return res.status(404).send('Product not found')
        }

        logger.info(`Fetched product id=${id}`);
        res.json(result.rows[0]);
        
    } catch (err) {
        logger.error(`Error fetching product id=${id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error fetching product');
    }
});

// GET products by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const result = await getProductByCategory(category);
        logger.info(`Fetched products in category=${category}`);
        res.json(result.rows);
    } catch (err) {
        logger.error(`Error fetching products by category=${req.params.category}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error fetching products');
    }
});

// POST - Add a new product
router.post('/', async (req, res) => {
    try {
        const {name, description, price, category, stock_quantity } = req.body;
        if (!name || !description || !price || !category || !stock_quantity) {
            logger.warn(`Missing fields in add product request`);
            return res.status(400).send('Missing required fields.')
        }
        const result = await addProduct(name, description, price, category, stock_quantity);
        logger.info(`Created product name=${name}`);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        logger.error(`Error creating product: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error creating product');
    }
});

// PUT - Update a product
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, stock_quantity } = req.body;
    try {
        if (!name || !description || !price || !category || !stock_quantity) {
            logger.warn(`Missing fields in update product request for id=${id}`);
            return res.status(400).send('Missing required fields.');
        }
        const result = await updateProduct(id, name, description, price, category, stock_quantity);
        logger.info(`Updated product id=${id}`);
        res.json(result.rows[0]);
    } catch (err) {
        logger.error(`Error updating product id=${id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error updating product');
    }
});

// DELETE a product by id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await deleteProduct(id);
        if (result.rows.length === 0) {
            logger.warn(`Delete failed: product id=${id} not found`);
            return res.status(404).send(`Product with ID ${id} not found`);
        }

        logger.info(`Deleted product id=${id}`);
        res.status(200).send(`Product with ID ${id} deleted`);
    } catch (err) {
        logger.error(`Error deleting product id=${id}: ${err.message}`, { stack: err.stack });
        res.status(500).send('Error deleting product')
    }
});

module.exports = router;


