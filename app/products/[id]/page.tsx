"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { Product } from "@/lib/products";
import { Check, ShoppingBag, ChevronLeft } from "lucide-react";

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data.product ?? null);
        setLoading(false);
      });
  }, [params.id]);

  function handleAdd() {
    if (!product) return;
    addItem(product);
    openCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="w-7 h-7 border-[1.5px] border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-black min-h-screen flex flex-col items-center justify-center text-center px-4">
        <p className="text-[#86868b] text-lg mb-4">Product not found</p>
        <Link href="/products" className="text-[#0071e3] hover:text-[#409cff] transition-colors text-sm font-medium">
          ← Back to Store
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock === 0;

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-12">

        {/* Breadcrumb */}
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-[#0071e3] hover:text-[#409cff] transition-colors text-sm font-medium mb-12 group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Store
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 lg:gap-20 items-start">

          {/* Image */}
          <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-[#111111]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className={`object-cover ${outOfStock ? "opacity-40" : ""}`}
              unoptimized
              priority
            />
            {outOfStock && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-black/70 backdrop-blur text-[#86868b] text-sm font-semibold px-5 py-2.5 rounded-full border border-white/10">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:pt-4">
            {/* Category */}
            <p className="text-[#86868b] text-xs font-semibold uppercase tracking-[0.15em] mb-3">
              {product.category}
            </p>

            {/* Name */}
            <h1 className="text-[clamp(28px,4vw,44px)] font-semibold text-white leading-tight tracking-tight mb-4">
              {product.name}
            </h1>

            {/* Description */}
            <p className="text-[#86868b] text-[15px] leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Specs */}
            {product.specs.length > 0 && (
              <div className="mb-8">
                <p className="text-[#86868b] text-xs font-semibold uppercase tracking-[0.12em] mb-3">
                  Highlights
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.specs.map((spec) => (
                    <span
                      key={spec}
                      className="bg-[#1c1c1e] text-[#f5f5f7] text-[13px] font-medium px-3 py-1.5 rounded-full border border-[#2c2c2e]"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-[#1d1d1f] mb-8" />

            {/* Price + Stock */}
            <div className="flex items-baseline justify-between mb-8">
              <p className="text-[clamp(28px,3vw,40px)] font-semibold text-white tracking-tight">
                R{product.price.toFixed(2)}
              </p>
              <p className={`text-sm font-medium ${outOfStock ? "text-[#ff453a]" : "text-[#30d158]"}`}>
                {outOfStock
                  ? "Out of stock"
                  : product.stock <= 3
                    ? `Only ${product.stock} left`
                    : "In stock"}
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-full text-[15px] font-semibold transition-all duration-200 active:scale-[0.98] ${
                added
                  ? "bg-[#30d158] text-white"
                  : outOfStock
                    ? "bg-[#1c1c1e] text-[#3a3a3c] cursor-not-allowed"
                    : "bg-[#0071e3] hover:bg-[#0077ed] text-white hover:shadow-lg hover:shadow-[#0071e3]/30"
              }`}
            >
              {added ? (
                <><Check size={18} strokeWidth={2.5} /> Added to Cart</>
              ) : (
                <><ShoppingBag size={18} /> {outOfStock ? "Out of Stock" : "Add to Cart"}</>
              )}
            </button>

            {!outOfStock && (
              <p className="text-center text-[#86868b] text-xs mt-4">
                Free delivery · Ships within 24 hours
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
