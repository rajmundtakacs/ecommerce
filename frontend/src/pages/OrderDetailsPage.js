import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const orderResponse = await fetch(`${process.env.REACT_APP_API_URL}/orders/${id}`, { credentials: 'include' });
        if (orderResponse.status === 401) return navigate('/login');
        if (orderResponse.status === 403) return navigate('/orders');
        if (!orderResponse.ok) throw new Error('Failed to fetch order');

        const orderData = await orderResponse.json();
        setOrder(orderData);

        const itemsResponse = await fetch(`${process.env.REACT_APP_API_URL}/orders/${id}/items`, { credentials: 'include' });
        if (!itemsResponse.ok) throw new Error('Could not load items for this order.');
        const itemsData = await itemsResponse.json();
        setItems(itemsData);
      } catch (err) {
        console.error('Failed to fetch order details:', err);
        setMessage(err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id, navigate]);

  const total = useMemo(() => {
    if (!items?.length) return Number(order?.total_price ?? 0);
    return items.reduce((sum, it) => {
      const price = Number(it.price ?? it.unit_price ?? 0);
      const qty = Number(it.quantity ?? 1);
      const lineTotal = it.total_price != null ? Number(it.total_price) : price * qty;
      return sum + lineTotal;
    }, 0);
  }, [items, order]);

  const fmt = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n || 0));

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-12 text-center text-zinc-600">
        Loading order…
      </section>
    );
  }

  if (!order) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="rounded-2xl border bg-white shadow-sm p-8">
          <p className="text-zinc-700">Order not found or access denied.</p>
          <Link to="/orders" className="inline-block mt-4 text-indigo-600 hover:underline">
            ← Back to Orders
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Order #{order.id}</h1>
          {(order.created_at || order.createdAt) && (
            <p className="mt-1 text-sm text-zinc-600">
              Placed on {new Date(order.created_at || order.createdAt).toLocaleString()}
            </p>
          )}
        </div>
        <Link to="/orders" className="text-sm text-indigo-600 hover:underline">
          ← Back to Orders
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 rounded-2xl border bg-white shadow-sm p-4 sm:p-6">
          {items.length === 0 ? (
            <p className="text-zinc-600">No items found in this order.</p>
          ) : (
            <ul className="divide-y divide-zinc-200">
              {items.map((item) => {
                const price = Number(item.price ?? item.unit_price ?? 0);
                const qty = Number(item.quantity ?? 1);
                const lineTotal =
                  item.total_price != null ? Number(item.total_price) : price * qty;

                const imgSrc = item.product_image || item.image || item.thumbnail || null;
                const title = item.product_name || item.name || `Item ${item.product_id}`;

                return (
                  <li
                    key={item.id ?? item.product_id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-zinc-100 overflow-hidden flex items-center justify-center">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-xs text-zinc-500">No image</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-zinc-900 line-clamp-1">{title}</div>
                        <div className="text-sm text-zinc-600">
                          Qty: {qty}
                          {price ? <span className="ml-2">• {fmt(price)} each</span> : null}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm font-medium text-zinc-900">{fmt(lineTotal)}</div>
                  </li>
                );
              })}
            </ul>
          )}

          {message && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {message}
            </div>
          )}
        </div>

        {/* Summary */}
        <aside className="rounded-2xl border bg-white shadow-sm p-4 sm:p-6 h-fit">
          <h3 className="text-lg font-semibold">Order Summary</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-600">Items</span>
              <span>{items.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Total</span>
              <span className="font-semibold">{fmt(total)}</span>
            </div>
          </div>

          {order.status && (
            <div className="mt-4 rounded-lg border px-3 py-2 text-sm border-zinc-200 bg-zinc-50 text-zinc-700">
              Status: <span className="font-medium">{order.status}</span>
            </div>
          )}

          <Link
            to="/orders"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-zinc-300 px-4 py-2.5 font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Back to Orders
          </Link>
        </aside>
      </div>
    </section>
  );
};

export default OrderDetailsPage;
