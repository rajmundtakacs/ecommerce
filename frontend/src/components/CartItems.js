import React from 'react';

const fmt = (n) =>
  `$${Number(n || 0).toFixed(2)}`;

const CartItems = ({ items, onRemove, readonly }) => (
  <ul className="divide-y divide-zinc-200">
    {items.map((item) => (
      <li
        key={item.product_id}
        className="py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        {/* Left side: image + name + qty */}
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
            <div className="text-sm text-zinc-600">Qty: {item.quantity}</div>
          </div>
        </div>

        {/* Right side: price + remove */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-sm font-medium text-zinc-900">
            {fmt(item.total_price)}
          </span>

          {!readonly && (
            <button
              onClick={() => onRemove(item.product_id)}
              className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-md border border-zinc-300 text-zinc-700 hover:bg-zinc-50 shrink-0 ml-auto sm:ml-0"
              aria-label={`Remove ${item.name} from cart`}
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
