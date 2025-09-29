import React, { useEffect, useState } from "react";
import Product from "./Product";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products`);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-zinc-600 py-12">
        Loading products…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-12">
        Error: {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center text-zinc-600 py-12">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Product key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
