const { query } = require('../db');

// Get all products
const getProducts = () => {
    return query('SELECT * FROM products ORDER BY name ASC;')
}

// Get product by id
const getProductById = (id) => {
    return query ('SELECT * FROM products WHERE id = $1;', [id]);
};

// Get product by category
const getProductByCategory = (category) => {
    return query ('SELECT * FROM products WHERE category ILIKE $1;', [`%${category}%`]);
}

// Add a new product
const addProduct = (name, description, price, category, stock_quantity) => {
    return query(
        'INSERT INTO products (name, description, price, category, stock_quantity) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
        [name, description, price, category, stock_quantity]
    );
};

// Update a product
const updateProduct = (id, name, description, price, category, stock_quantity) => {
    return query(
        'UPDATE products SET name = $1, description = $2, price = $3, category = $4, stock_quantity = $5 WHERE id = $6 RETURNING *;',
        [name, description, price, category, stock_quantity, id]
    );
};

// Delete a product
const deleteProduct = (id) => {
    return query('DELETE FROM products WHERE id = $1 RETURNING *;', [id]);
};

module.exports = {
    getProducts,
    getProductById,
    getProductByCategory,
    addProduct,
    updateProduct,
    deleteProduct
};