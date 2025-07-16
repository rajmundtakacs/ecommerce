import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const CartPage = () => {
    const [cartId, setCartId] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const responseCart = await fetch('/carts/current', {
                    credentials: 'include'
                });
                if (!responseCart.ok) throw new Error('Failed to fetch cart');
                const carts = await responseCart.json();
                if (carts.length === 0) {
                    setMessage("Your cart is empty.");
                    setLoading(false);
                    return;
                }
                const cart_id = carts[0].id;
                setCartId(cart_id);

                const responseItems = await fetch(`/carts/${cart_id}/items`, {
                    credentials: 'include'
                });
                if (!responseItems.ok) throw new Error('Failed to fetch cart items');
                const items = await responseItems.json();
                setCartItems(items);
            } catch (err) {
                console.error(err);
                setMessage(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, []);

    const removeItem = async (product_id) => {
        try {
            await fetch(`/carts/${cartId}/items/${product_id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            setCartItems(prev => prev.filter(item => item.product_id !== product_id));
        } catch (err) {
            console.error('Error removing item:', err);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!cartItems.length) return <p>{message || "Your cart is empty."}</p>;

    return (
        <div>
            <h2>Your Cart</h2>
            <ul>
                {cartItems.map(item => (
                    <li key={item.product_id}>
                        {item.name} - Qty: {item.quantity} - ${item.total_price}
                        <button onClick ={() => removeItem(item.product_id)}>Remove</button>
                    </li>
                ))}
            </ul>
            <Link to="/checkout">
                <button>Proceed to Checkout</button>
            </Link>
            {message && <p>{message}</p>}
        </div>
    )
};

export default CartPage;