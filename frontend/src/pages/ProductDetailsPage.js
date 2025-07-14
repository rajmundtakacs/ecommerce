import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/products/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch product');
                }
                const data = await response.json();
                setProduct(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const addToCart = async () => {
        try {
            const response = await fetch('/carts/items', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({
                    product_id: product.id,
                    quantity: 1
                })
            });
            if (!response.ok) throw new Error('Could not add to cart');
            alert('Product added to cart!');
        } catch(err) {
            alert(`Error: ${err.message}`);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!product) return <p>No product found.</p>;

    return (
        <div>
            <img src={product.image} alt={product.name} width="300" />
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <button onClick={addToCart}>Add to Cart</button>
        </div>
    );
};

export default ProductDetailsPage;