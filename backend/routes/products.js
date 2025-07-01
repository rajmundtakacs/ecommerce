const express = require('express');
const router = express.Router();
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
        res.json(result.rows);
    } catch (err) {
        console.err(err);
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
            return res.status(404).send('Product not found')
        }

        res.json(result.rows[0]);
        
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching product');
    }
});

// GET products by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const result = await getProductByCategory(category);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send('Error fetching products');
    }
});

// POST - Add a new product
router.post('/', async (req, res) => {
    try {
        const {name, description, price, category, stock_quantity } = req.body;
        if (!name || !description || !price || !category || !stock_quantity) {
            return res.status(400).send('Missing required fields.')
        }
        const result = await addProduct(name, description, price, category, stock_quantity);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).send('Error creating product');
    }
});

// PUT - Update a product
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, stock_quantity } = req.body;
    try {
        const result = await updateProduct(id, name, description, price, category, stock_quantity);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating product');
    }
});

// DELETE a product by id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await deleteProduct(id);
        res.status(200).send(`Product with ID ${id} deleted`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting product')
    }
});

module.exports = router;


