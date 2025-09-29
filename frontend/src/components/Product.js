import React from "react";
import { Link } from "react-router-dom";

const Product = ({ product }) => {
  return (
    <div className="group rounded-2xl border bg-white shadow-sm hover:shadow-md transition overflow-hidden">
      <Link to={`/products/${product.id}`} className="flex flex-col h-full">
        {/* image */}
        <div className="aspect-square bg-zinc-100 flex items-center justify-center overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>

        {/* content */}
        <div className="p-4 flex flex-col flex-1">
          <h2 className="text-lg font-semibold text-zinc-900 line-clamp-1">
            {product.name}
          </h2>
          <p className="mt-1 text-sm text-zinc-600 line-clamp-2">
            {product.description}
          </p>

          <div className="mt-auto pt-4">
            <span className="inline-block text-indigo-600 font-medium hover:underline">
              View details →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Product;
