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
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Your Orders</h1>
            
            
            {orders.length === 0 ? (
                <p>You have no orders yet.</p>
            ) : (
                orders.map(order => (
                    <Link key={order.id} to={`/orders/${order.id}`}>
                        <p>Order #{order.id}</p>
                        <p>Total price {order.total_price}</p>
                    </Link>
                ))
            )}
            
        </div>
    );
};

export default OrdersPage;