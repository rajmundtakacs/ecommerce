import React from 'react';

const CartItems = ({ items, onRemove, readonly }) => (
  <ul className="divide-y divide-zinc-200">
    {items.map((item) => (
      <li
        key={item.product_id}
        className="flex items-center justify-between gap-4 py-4"
      >
        {/* Left side: product info */}
        <div className="flex items-center gap-4">
          {item.image && (
            <img
              src={item.image}
              alt={item.name}
              className="h-16 w-16 rounded-lg object-cover bg-zinc-100"
              loading="lazy"
            />
          )}
          <div>
            <div className="font-medium text-zinc-900">{item.name}</div>
            <div className="text-sm text-zinc-600">
              Qty: {item.quantity}
            </div>
          </div>
        </div>

        {/* Right side: price + action */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-zinc-900">
            ${item.total_price}
          </span>
          {!readonly && (
            <button
              onClick={() => onRemove(item.product_id)}
              className="px-3 py-1.5 text-sm rounded-md border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
            >
              Remove
            </button>
          )}
        </div>
      </li>
    ))}
  </ul>
);

export default CartItems;


