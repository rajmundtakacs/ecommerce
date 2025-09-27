import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      {/* 4rem ≈ h-16 navbar magasság; igazítsd ha más a navbar */}
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-900">
          Welcome to <span className="text-indigo-600">PERN Shop</span> 🎉
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          A simple, modern e-commerce app. Browse our products and fill your cart in seconds.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/products"
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition text-center"
          >
            Browse Products
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl border border-zinc-300 font-medium text-zinc-700 hover:bg-zinc-50 transition text-center"
          >
            Join Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
