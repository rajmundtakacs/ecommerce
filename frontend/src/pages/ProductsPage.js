import React from "react";
import ProductList from "../components/ProductList";

const ProductsPage = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
          Our Products
        </h1>
        <p className="mt-2 text-zinc-600">
          Browse our collection and find your favorites.
        </p>
      </div>

      <ProductList />
    </section>
  );
};

export default ProductsPage;
