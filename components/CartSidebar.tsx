"use client";

import { useCartStore } from "@/lib/store";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CartSidebar() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, total } = useCartStore();

  if (!isOpen) return null;

  const orderTotal = total();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={toggleCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[400px] bg-[#111111] z-50 flex flex-col shadow-2xl border-l border-[#1d1d1f]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1d1d1f]">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-[#86868b]" />
            <h2 className="text-white font-semibold text-[15px]">
              Cart
              {items.length > 0 && (
                <span className="ml-2 text-[#86868b] font-normal text-sm">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={toggleCart}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1c1c1e] hover:bg-[#2c2c2e] text-[#86868b] hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <div className="w-16 h-16 rounded-full bg-[#1c1c1e] flex items-center justify-center">
              <ShoppingBag size={28} className="text-[#3a3a3c]" />
            </div>
            <p className="text-[#86868b] text-[15px]">Your cart is empty</p>
            <button
              onClick={toggleCart}
              className="text-[#0071e3] hover:text-[#409cff] text-sm font-medium transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4 bg-[#1c1c1e] rounded-2xl p-4">
                  <div className="relative w-18 h-18 rounded-xl overflow-hidden flex-shrink-0 bg-[#2c2c2e]" style={{ width: 72, height: 72 }}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-[#f5f5f7] font-medium text-sm leading-snug truncate">
                        {product.name}
                      </p>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="text-[#3a3a3c] hover:text-[#86868b] transition-colors flex-shrink-0 mt-0.5"
                      >
                        <X size={13} />
                      </button>
                    </div>
                    <p className="text-[#0071e3] font-semibold text-sm mb-3">
                      R{product.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-7 h-7 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] flex items-center justify-center text-white transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-white text-sm w-6 text-center font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-7 h-7 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] flex items-center justify-center text-white transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-6 border-t border-[#1d1d1f] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[#86868b] text-sm">Total</span>
                <span className="text-white font-semibold text-xl">
                  R{orderTotal.toFixed(2)}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={toggleCart}
                className="flex items-center justify-center gap-2 w-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold py-3.5 rounded-full text-[15px] transition-all active:scale-[0.98] hover:shadow-lg hover:shadow-[#0071e3]/30"
              >
                Checkout <ArrowRight size={16} />
              </Link>
              <p className="text-center text-[#86868b] text-xs">
                Free delivery on all orders
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
