import React, { useEffect, useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import CartItems from '../components/CartItems';

const CheckoutPage = () => {
    const [cartId, setCartId] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [clientSecret, setClientSecret] = useState('');
    const [amount, setAmount] = useState(0);

    const stripe = useStripe();
    const elements = useElements();

    useEffect(() => {
        const fetchCartAndCreateIntent = async () => {
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

                const total = items.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
                setAmount(total);

                const responseIntent = await fetch('/stripe/create-payment-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: Math.round(total * 100) })
                });
                if (!responseIntent.ok) throw new Error('Failed to create payment intent');
                const intentData = await responseIntent.json();
                setClientSecret(intentData.clientSecret);

            } catch (err) {
                console.error(err);
                setMessage(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCartAndCreateIntent();
    }, []);

    const handleCheckout = async (e) => {

        e.preventDefault();
        if (!stripe || !elements || !clientSecret) return;

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement),
            }
        });

        if (result.error) {
            console.error(result.error);
            setMessage(result.error.message);
        } else if (result.paymentIntent.status === 'succeeded') {
            try {
                const response = await fetch('/carts/checkout', {
                    method: 'POST',
                    credentials: 'include'
                });
                if (!response.ok) throw new Error('Checkout failed');
                const data = await response.json();
                setMessage(`✅ Payment successful! Order ID: ${data.order.id}`);
                setCartItems([]);
            } catch (err) {
                console.error(err);
                setMessage(err.message);
            }
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h2>Checkout</h2>
            <CartItems items={cartItems} readonly />
            <p>Total: ${amount.toFixed(2)}</p>
            <form onSubmit={handleCheckout}>
                <CardElement />
                <button type="submit" disabled={!stripe || !clientSecret || amount <= 0}>
                    Pay ${amount.toFixed(2)}
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    )
};

export default CheckoutPage;