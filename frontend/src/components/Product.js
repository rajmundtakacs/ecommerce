import React from 'react';

const Product = ({ product }) => {
    return (
        <div>
            <img src={product.image} alt={product.name} width="200" loading="lazy" />
            <h2>{product.name}</h2>
            <p>{product.description}</p>
        </div>
    );
};

export default Product;