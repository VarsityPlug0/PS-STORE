"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { ShoppingBag, Package } from "lucide-react";

export default function Navbar() {
  const { count, toggleCart } = useCartStore();
  const itemCount = count();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-12">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-0.5 group">
            <span className="text-white font-black text-xl tracking-tight">PS</span>
            <span className="text-[#0071e3] font-black text-2xl leading-none group-hover:text-[#409cff] transition-colors">.</span>
          </Link>

          {/* Nav */}
          <div className="hidden md:flex items-center gap-7">
            {[
              { href: "/products", label: "Store" },
              { href: "/products?category=Console", label: "Consoles" },
              { href: "/products?category=Controller", label: "Controllers" },
              { href: "/products?category=Accessory", label: "Accessories" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#86868b] hover:text-white transition-colors duration-200 text-[13px] font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-5">
            <Link
              href="/track"
              className="hidden md:flex text-[#86868b] hover:text-white transition-colors"
              title="Track Order"
            >
              <Package size={17} />
            </Link>
            <button
              onClick={toggleCart}
              className="relative text-[#86868b] hover:text-white transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={19} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#0071e3] text-white text-[9px] font-bold w-[17px] h-[17px] rounded-full flex items-center justify-center leading-none">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
