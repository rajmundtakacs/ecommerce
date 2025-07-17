import React from 'react';

const CartItems = ({ items, onRemove, readonly }) => (
    <ul>
        {items.map(item => (
            <li key={item.product_id}>
                {item.name} - Qty: {item.quantity} - ${item.total_price}
                {!readonly && <button onClick={() => onRemove(item.product_id)}>Remove</button>}
            </li>
        ))}
    </ul>
);

export default CartItems;

