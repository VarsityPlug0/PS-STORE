import Link from "next/link";
import { getProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getProducts();
  const consoles = products.filter((p) => p.category === "Console").slice(0, 3);
  const controllers = products.filter((p) => p.category === "Controller").slice(0, 3);

  return (
    <div className="bg-black">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[#0071e3]/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-block text-[#0071e3] text-xs font-semibold uppercase tracking-[0.2em] mb-6">
            New Arrivals Available
          </span>
          <h1 className="text-[clamp(48px,8vw,96px)] font-semibold text-white leading-[1.05] tracking-tight mb-6">
            The Ultimate
            <br />
            <span
              style={{
                background:
                  "linear-gradient(135deg, #f5f5f7 0%, #86868b 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              PlayStation Store.
            </span>
          </h1>
          <p className="text-[#86868b] text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            The latest consoles, controllers, and accessories. Delivered fast across South Africa.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/products"
              className="bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium px-8 py-3 rounded-full text-[15px] transition-all duration-200 hover:shadow-lg hover:shadow-[#0071e3]/30 active:scale-[0.98]"
            >
              Shop Now
            </Link>
            <Link
              href="/products?category=Console"
              className="text-[#0071e3] hover:text-[#409cff] font-medium text-[15px] transition-colors flex items-center gap-1 group"
            >
              View Consoles
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="w-[1px] h-10 bg-gradient-to-b from-transparent to-white/60" />
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────────── */}
      <section className="border-y border-[#1d1d1f] bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: "🚚", label: "Free Delivery", sub: "On all orders" },
            { icon: "⚡", label: "Fast Dispatch", sub: "Within 24 hours" },
            { icon: "🔒", label: "Secure Payment", sub: "Card & EFT" },
            { icon: "↩️", label: "7-Day Returns", sub: "Hassle-free" },
          ].map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-1">
              <span className="text-2xl mb-1">{f.icon}</span>
              <p className="text-white text-sm font-semibold">{f.label}</p>
              <p className="text-[#86868b] text-xs">{f.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED CONSOLES ────────────────────────────────────── */}
      {consoles.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[#86868b] text-xs font-semibold uppercase tracking-[0.15em] mb-2">
                Featured
              </p>
              <h2 className="text-[clamp(28px,4vw,48px)] font-semibold text-white tracking-tight">
                PlayStation Consoles
              </h2>
            </div>
            <Link
              href="/products?category=Console"
              className="hidden sm:flex text-[#0071e3] hover:text-[#409cff] text-sm font-medium transition-colors items-center gap-1 group"
            >
              See all
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {consoles.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── FULL-WIDTH BANNER ────────────────────────────────────── */}
      <section className="relative mx-4 sm:mx-6 lg:mx-12 rounded-[2rem] overflow-hidden mb-8">
        <div className="bg-[#111111] px-8 py-20 md:py-28 text-center relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-[#0071e3]/8 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-purple-600/5 rounded-full blur-[80px]" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="text-[#0071e3] text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              PlayStation 5
            </p>
            <h2 className="text-[clamp(32px,5vw,64px)] font-semibold text-white tracking-tight leading-tight mb-4">
              Power. Speed.
              <br />Next-gen gaming.
            </h2>
            <p className="text-[#86868b] mb-8 text-base max-w-md mx-auto">
              Experience blazing-fast load times, ray tracing, and 4K gaming on the PlayStation 5.
            </p>
            <Link
              href="/products?category=Console"
              className="inline-block bg-white text-black font-semibold px-8 py-3 rounded-full text-sm hover:bg-[#f5f5f7] transition-all active:scale-[0.98]"
            >
              Shop Consoles
            </Link>
          </div>
        </div>
      </section>

      {/* ── CONTROLLERS ──────────────────────────────────────────── */}
      {controllers.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[#86868b] text-xs font-semibold uppercase tracking-[0.15em] mb-2">
                Control
              </p>
              <h2 className="text-[clamp(28px,4vw,48px)] font-semibold text-white tracking-tight">
                DualSense Controllers
              </h2>
            </div>
            <Link
              href="/products?category=Controller"
              className="hidden sm:flex text-[#0071e3] hover:text-[#409cff] text-sm font-medium transition-colors items-center gap-1 group"
            >
              See all
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {controllers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── BOTTOM CTA ───────────────────────────────────────────── */}
      <section className="border-t border-[#1d1d1f] py-20 text-center px-6">
        <h2 className="text-[clamp(24px,3vw,36px)] font-semibold text-white mb-3 tracking-tight">
          Ready to level up?
        </h2>
        <p className="text-[#86868b] mb-8 max-w-md mx-auto">
          Browse our full catalogue of PlayStation products with fast, free delivery across South Africa.
        </p>
        <Link
          href="/products"
          className="inline-block bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium px-8 py-3 rounded-full text-[15px] transition-all hover:shadow-lg hover:shadow-[#0071e3]/30 active:scale-[0.98]"
        >
          Browse All Products
        </Link>
      </section>

    </div>
  );
}
