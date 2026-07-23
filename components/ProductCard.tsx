"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { Check, Plus } from "lucide-react";
import { Product } from "@/lib/products";
import { useState } from "react";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, openCart } = useCartStore();
  const [added, setAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    addItem(product);
    openCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const outOfStock = product.stock === 0;

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-[#111111] rounded-[20px] overflow-hidden transition-all duration-300 hover:bg-[#161616] hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/60">

        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-700 group-hover:scale-105 ${outOfStock ? "opacity-40" : ""}`}
            unoptimized
          />

          {/* Badges */}
          <div className="absolute top-3.5 left-3.5 flex gap-2">
            <span className="bg-black/60 backdrop-blur-sm text-[#86868b] text-[10px] font-semibold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full">
              {product.category}
            </span>
          </div>

          {product.stock > 0 && product.stock <= 3 && (
            <div className="absolute top-3.5 right-3.5">
              <span className="bg-[#ff453a]/90 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                Only {product.stock} left
              </span>
            </div>
          )}

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-black/70 backdrop-blur-sm text-[#86868b] text-sm font-semibold px-4 py-2 rounded-full border border-white/10">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="text-[#f5f5f7] font-semibold text-[15px] leading-snug mb-1 truncate">
            {product.name}
          </h3>
          <p className="text-[#86868b] text-[13px] line-clamp-1 mb-4">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-white font-semibold text-[17px]">
              R{product.price.toFixed(2)}
            </span>
            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className={`flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-full transition-all duration-200 active:scale-95 ${
                added
                  ? "bg-[#30d158] text-white"
                  : outOfStock
                    ? "bg-[#1d1d1f] text-[#3a3a3c] cursor-not-allowed"
                    : "bg-[#0071e3] hover:bg-[#0077ed] text-white"
              }`}
            >
              {added ? <Check size={13} strokeWidth={3} /> : <Plus size={13} strokeWidth={3} />}
              {added ? "Added" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
