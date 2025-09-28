import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/orders/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.status === 401) {
          navigate('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-12 text-center text-zinc-600">
        Loading your orders…
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Your Orders
        </h1>
        <p className="mt-1 text-zinc-600">
          Review your past purchases and check their details.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border bg-white shadow-sm p-8 text-center">
          <p className="text-zinc-600">You have no orders yet.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                to={`/orders/${order.id}`}
                className="block rounded-xl border bg-white shadow-sm hover:shadow-md transition p-4 sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    Order #{order.id}
                  </h2>
                  <span className="text-sm text-zinc-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-zinc-600">
                  Total: <span className="font-medium">${order.total_price}</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default OrdersPage;
