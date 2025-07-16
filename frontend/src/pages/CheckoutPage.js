import React, { useEffect, useState } from 'react';

const CheckoutPage = () => {
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

    const handleCheckout = async () => {
        try {
            const response = await fetch('/carts/checkout', {
                method: 'POST',
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Checkout failed');
            const data = await response.json();
            setMessage(`Checkout successful! Order ID: ${data.order.id}`);
            setCartItems([]);
        } catch (err) {
            console.error(err);
            setMessage(err.message);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h2>Checkout</h2>
            <ul>
                {cartItems.map(item => (
                    <li key={item.product_id}>
                        {item.name} - Qty: {item.quantity} - ${item.total_price}
                    </li>
                ))}
            </ul>
            <button onClick={handleCheckout}>Place order</button>
            {message && <p>{message}</p>}
        </div>
    )
};

export default CheckoutPage;