import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/carts/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
      });
      if (!res.ok) throw new Error("Could not add to cart");
      setSuccessMessage("Product added to cart!");
    } catch (err) {
      setSuccessMessage("");
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center text-zinc-600 py-12">Loading…</div>;
  if (error)   return <div className="text-center text-red-600 py-12">Error: {error}</div>;
  if (!product) return <div className="text-center text-zinc-600 py-12">No product found.</div>;

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      {/* vissza gomb */}
      <div className="mb-6">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition"
        >
          ← Back to Products
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image */}
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="aspect-square bg-zinc-100">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            {product.name}
          </h1>

          {product.price != null && (
            <div className="text-2xl font-semibold text-indigo-600">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(Number(product.price))}
            </div>
          )}

          <p className="text-zinc-700 leading-relaxed">
            {product.description}
          </p>

          {/* Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={addToCart}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition"
            >
              Add to Cart
            </button>
          </div>

          {successMessage && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsPage;
