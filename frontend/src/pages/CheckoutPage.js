import React, { useEffect, useState, useMemo } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import CartItems from '../components/CartItems';

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#0a0a0a',
      '::placeholder': { color: '#9ca3af' }, // zinc-400
    },
    invalid: { color: '#dc2626' }, // red-600
  },
  hidePostalCode: true,
};

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
        const responseCart = await fetch('/carts/current', { credentials: 'include' });
        if (!responseCart.ok) throw new Error('Failed to fetch cart');
        const carts = await responseCart.json();
        if (!carts || carts.length === 0) {
          setMessage("Your cart is empty.");
          return;
        }
        const cart_id = carts[0].id;
        setCartId(cart_id);

        const responseItems = await fetch(`/carts/${cart_id}/items`, { credentials: 'include' });
        if (!responseItems.ok) throw new Error('Failed to fetch cart items');
        const items = await responseItems.json();
        setCartItems(items);

        const total = items.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
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
        setMessage(err.message || 'Something went wrong.');
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
      payment_method: { card: elements.getElement(CardElement) }
    });

    if (result.error) {
      console.error(result.error);
      setMessage(result.error.message || 'Payment failed.');
    } else if (result.paymentIntent.status === 'succeeded') {
      try {
        const response = await fetch('/carts/checkout', { method: 'POST', credentials: 'include' });
        if (!response.ok) throw new Error('Checkout failed');
        const data = await response.json();
        setMessage(`✅ Payment successful! Order ID: ${data.order.id}`);
        setCartItems([]);
        setAmount(0);
      } catch (err) {
        console.error(err);
        setMessage(err.message || 'Checkout failed.');
      }
    }
  };

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-12 text-center text-zinc-600">
        Loading checkout…
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Checkout</h2>
        <p className="mt-1 text-zinc-600">Review your items and complete payment.</p>
      </div>

      {/* Empty cart case */}
      {(!cartItems || cartItems.length === 0) ? (
        <div className="rounded-2xl border bg-white shadow-sm p-8 text-center">
          <p className="text-zinc-600">{message || 'Your cart is empty.'}</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Items */}
          <div className="lg:col-span-2 rounded-2xl border bg-white shadow-sm p-4 sm:p-6">
            <CartItems items={cartItems} readonly />
          </div>

          {/* Right: Summary + Payment */}
          <aside className="rounded-2xl border bg-white shadow-sm p-4 sm:p-6 h-fit">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600">Items</span>
                <span>{cartItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Total</span>
                <span className="font-semibold">
                  ${amount.toFixed(2)}
                </span>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Card details
              </label>
              <div className="rounded-xl border border-zinc-300 px-3 py-3">
                <CardElement options={cardElementOptions} />
              </div>

              <button
                type="submit"
                disabled={!stripe || !clientSecret || amount <= 0}
                className="w-full rounded-xl bg-indigo-600 text-white px-4 py-2.5 font-medium hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                Pay ${amount.toFixed(2)}
              </button>
            </form>

            {message && (
              <div
                className={`mt-4 rounded-lg px-3 py-2 text-sm ${
                  message.startsWith('✅')
                    ? 'border border-green-200 bg-green-50 text-green-700'
                    : 'border border-amber-200 bg-amber-50 text-amber-800'
                }`}
              >
                {message}
              </div>
            )}
          </aside>
        </div>
      )}
    </section>
  );
};

export default CheckoutPage;
