import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const orderResponse = await fetch(`/orders/${id}`, {
                    credentials: 'include',
                });

                if (orderResponse.status === 401) return navigate('/login');
                if (orderResponse.status === 403) return navigate('/orders');

                const orderData = await orderResponse.json();
                setOrder(orderData);

                const itemsResponse = await fetch(`/orders/${id}/items`, {
                    credentials: 'include',
                });

                if (itemsResponse.ok) {
                    const itemsData = await itemsResponse.json();
                    setItems(itemsData);
                }
            } catch (err) {
                console.error('Failed to fetch order details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id, navigate]);

    if (loading) return <div>Loading...</div>
    if(!order) return <div>Order not found or access denied</div>

    return (
        <div>
            <h1>Order #{order.id}</h1>
            {items.length === 0 ? (
                <p>No items found in this order.</p>
            ) : (
                <ul>
                    {items.map((item) => (
                        <li key={item.id}>{item.name} - {item.quantity} - ${item.quantity}</li>
                    ))}
                </ul>
            )}
            <Link to="/orders">Back to Orders</Link>
        </div>
    );
};

export default OrderDetailsPage;
