import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import CartItems from '../components/CartItems';

const CartPage = () => {
  const [cartId, setCartId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const responseCart = await fetch(`${process.env.REACT_APP_API_URL}/carts/current`, { credentials: 'include' });
        if (!responseCart.ok) throw new Error('Failed to fetch cart');
        const carts = await responseCart.json();
        if (!carts || carts.length === 0) {
          setMessage("Your cart is empty.");
          return;
        }
        const cart_id = carts[0].id;
        setCartId(cart_id);

        const responseItems = await fetch(`${process.env.REACT_APP_API_URL}/carts/${cart_id}/items`, { credentials: 'include' });
        if (!responseItems.ok) throw new Error('Failed to fetch cart items');
        const items = await responseItems.json();
        setCartItems(items);
      } catch (err) {
        console.error(err);
        setMessage(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const removeItem = async (product_id) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/carts/${cartId}/items/${product_id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      setCartItems(prev => prev.filter(item => item.product_id !== product_id));
    } catch (err) {
      console.error('Error removing item:', err);
      setMessage('Could not remove item. Please try again.');
    }
  };

  // Optional subtotal (only if items have price & quantity)
  const subtotal = useMemo(() => {
    if (!cartItems?.length) return 0;
    return cartItems.reduce((sum, it) => {
      const price = Number(it.price ?? it.product?.price ?? 0);
      const qty = Number(it.quantity ?? 1);
      return sum + price * qty;
    }, 0);
  }, [cartItems]);

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-12 text-center text-zinc-600">
        Loading your cart…
      </section>
    );
  }

  if (!cartItems.length) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="rounded-2xl border bg-white shadow-sm p-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Your Cart</h2>
          <p className="mt-2 text-zinc-600">{message || "Your cart is empty."}</p>
          <Link
            to="/products"
            className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Cart</h2>
        <Link to="/products" className="text-sm text-indigo-600 hover:underline">
          ← Continue shopping
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items list */}
        <div className="lg:col-span-2 rounded-2xl border bg-white shadow-sm p-4 sm:p-6">
          <CartItems items={cartItems} onRemove={removeItem} />
        </div>

        {/* Summary */}
        <aside className="rounded-2xl border bg-white shadow-sm p-4 sm:p-6 h-fit">
          <h3 className="text-lg font-semibold">Order Summary</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-600">Items</span>
              <span>{cartItems.length}</span>
            </div>
            {/* Subtotal only if prices are present */}
            {subtotal > 0 && (
              <div className="flex justify-between">
                <span className="text-zinc-600">Subtotal</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subtotal)}
                </span>
              </div>
            )}
          </div>

          <Link
            to="/checkout"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 text-white px-4 py-2.5 font-medium hover:bg-indigo-500"
          >
            Proceed to Checkout
          </Link>

          {message && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {message}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
};

export default CartPage;
