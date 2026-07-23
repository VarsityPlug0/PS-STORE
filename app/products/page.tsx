import { getProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

const CATEGORIES = ["All", "Console", "Controller", "Accessory", "Game"];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const allProducts = getProducts();
  const products =
    category && category !== "All"
      ? allProducts.filter((p) => p.category === category)
      : allProducts;

  const activeCategory = category ?? "All";

  return (
    <div className="bg-black min-h-screen">
      {/* Header */}
      <div className="border-b border-[#1d1d1f]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-16 pb-8">
          <p className="text-[#86868b] text-xs font-semibold uppercase tracking-[0.15em] mb-2">
            PS Store
          </p>
          <h1 className="text-[clamp(32px,5vw,56px)] font-semibold text-white tracking-tight">
            {activeCategory === "All" ? "All Products" : activeCategory + "s"}
          </h1>
          <p className="text-[#86868b] text-sm mt-2">
            {products.length} product{products.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {/* Category tabs */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex gap-0 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat;
              return (
                <a
                  key={cat}
                  href={cat === "All" ? "/products" : `/products?category=${cat}`}
                  className={`flex-shrink-0 px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                    active
                      ? "text-white border-[#0071e3]"
                      : "text-[#86868b] border-transparent hover:text-[#f5f5f7]"
                  }`}
                >
                  {cat}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16">
        {products.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-[#86868b] text-lg">No products in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
