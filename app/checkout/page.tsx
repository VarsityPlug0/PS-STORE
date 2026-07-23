"use client";

import { useCartStore } from "@/lib/store";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingBag, CreditCard, Banknote, ChevronRight } from "lucide-react";

const SA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
];

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

const EMPTY: CustomerForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  province: "Gauteng",
  postalCode: "",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full bg-gray-800 border border-gray-700 focus:border-blue-500 text-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm placeholder-gray-600";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const router = useRouter();
  const [form, setForm] = useState<CustomerForm>(EMPTY);
  const [loading, setLoading] = useState<"card" | "eft" | null>(null);
  const [error, setError] = useState("");
  const [stripeFallback, setStripeFallback] = useState<{ orderId: string } | null>(null);

  function set(key: keyof CustomerForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(paymentMethod: "card" | "eft") {
    setLoading(paymentMethod);
    setError("");
    setStripeFallback(null);

    // Create the order first
    const orderRes = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: form,
        items: items.map((i) => ({
          id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          image: i.product.image,
          quantity: i.quantity,
        })),
        total: total(),
        paymentMethod,
      }),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      setError(orderData.error ?? "Failed to create order.");
      setLoading(null);
      return;
    }

    const orderId: string = orderData.order.id;

    if (paymentMethod === "eft") {
      clearCart();
      router.push(`/eft-payment/${orderId}?email=${encodeURIComponent(form.email)}`);
      return;
    }

    // Card: attempt Stripe — fall back to EFT on any error
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.product.id,
            name: i.product.name,
            price: i.product.price,
            image: i.product.image,
            quantity: i.quantity,
          })),
          orderId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        clearCart();
        window.location.href = data.url;
        return;
      }

      // Stripe returned an error response — surface the EFT fallback
      setStripeFallback({ orderId });
      setLoading(null);
    } catch {
      // Network / unexpected error — surface the EFT fallback
      setStripeFallback({ orderId });
      setLoading(null);
    }
  }

  async function handleSubmit(e: React.FormEvent, method: "card" | "eft") {
    e.preventDefault();
    await submit(method);
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="text-gray-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">
          Your cart is empty
        </h1>
        <p className="text-gray-400 mb-8">
          Add some products before checking out.
        </p>
        <Link
          href="/products"
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition-colors"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  const orderTotal = total();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/products" className="hover:text-gray-300 transition-colors">
          Products
        </Link>
        <ChevronRight size={14} />
        <Link href="/checkout" className="text-white font-medium">
          Checkout
        </Link>
      </div>

      <h1 className="text-3xl font-black text-white mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* Left: Customer Details Form */}
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-5">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Full Name *">
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="John Smith"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    required
                  />
                </Field>
              </div>
              <Field label="Email Address *">
                <input
                  type="email"
                  className={inputClass}
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  required
                />
              </Field>
              <Field label="Phone Number *">
                <input
                  type="tel"
                  className={inputClass}
                  placeholder="+27 82 123 4567"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  required
                />
              </Field>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-5">
              Shipping Address
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Street Address *">
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="123 Main Street, Apt 4B"
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    required
                  />
                </Field>
              </div>
              <Field label="City *">
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Johannesburg"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  required
                />
              </Field>
              <Field label="Province *">
                <select
                  className={inputClass}
                  value={form.province}
                  onChange={(e) => set("province", e.target.value)}
                >
                  {SA_PROVINCES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field label="Postal Code *">
                <input
                  type="text"
                  className={inputClass}
                  placeholder="2000"
                  value={form.postalCode}
                  onChange={(e) => set("postalCode", e.target.value)}
                  required
                />
              </Field>
            </div>
          </div>

          {stripeFallback && (
            <div className="bg-amber-900/20 border border-amber-500/40 rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <CreditCard size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-300 font-semibold text-sm">Card payment is unavailable right now</p>
                  <p className="text-amber-400/70 text-xs mt-1">
                    Stripe could not process your payment. Your order has been saved — you can complete it by EFT instead.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  clearCart();
                  router.push(`/eft-payment/${stripeFallback.orderId}?email=${encodeURIComponent(form.email)}`);
                }}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-colors text-sm"
              >
                <Banknote size={18} />
                Continue to EFT Payment — Get Banking Details
              </button>
              <p className="text-amber-400/50 text-xs text-center mt-3">
                Order reference: <span className="font-mono text-amber-300">{stripeFallback.orderId}</span>
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm">
              {error}
            </div>
          )}

          {/* Payment Buttons */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-2">
              Payment Method
            </h2>
            <p className="text-gray-500 text-sm mb-5">
              Choose how you&apos;d like to pay. Both options are secure.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={
                  loading !== null ||
                  stripeFallback !== null ||
                  !form.name ||
                  !form.email ||
                  !form.phone ||
                  !form.address ||
                  !form.city ||
                  !form.postalCode
                }
                onClick={(e) => handleSubmit(e, "card")}
                className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors"
              >
                <CreditCard size={20} />
                {loading === "card" ? "Processing..." : "Pay by Card"}
              </button>
              <button
                type="button"
                disabled={
                  loading !== null ||
                  stripeFallback !== null ||
                  !form.name ||
                  !form.email ||
                  !form.phone ||
                  !form.address ||
                  !form.city ||
                  !form.postalCode
                }
                onClick={(e) => handleSubmit(e, "eft")}
                className="flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors"
              >
                <Banknote size={20} />
                {loading === "eft" ? "Processing..." : "Pay via EFT"}
              </button>
            </div>
            <p className="text-gray-600 text-xs text-center mt-4">
              Card payments are processed by Stripe. EFT orders ship after payment is verified (1–2 business days).
            </p>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden sticky top-24">
            <div className="p-5 border-b border-gray-800">
              <h2 className="text-white font-bold">
                Order Summary ({items.length} item{items.length !== 1 ? "s" : ""})
              </h2>
            </div>
            <div className="divide-y divide-gray-800">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3 p-4">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {product.name}
                    </p>
                    <p className="text-gray-500 text-xs">Qty: {quantity}</p>
                  </div>
                  <p className="text-white text-sm font-semibold">
                    R{(product.price * quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-5 space-y-3 border-t border-gray-800">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal</span>
                <span>R{orderTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Shipping</span>
                <span className="text-green-400 font-medium">Free</span>
              </div>
              <div className="border-t border-gray-700 pt-3 flex justify-between text-white font-black text-lg">
                <span>Total</span>
                <span>R{orderTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="px-5 pb-5">
              <Link
                href="/track"
                className="block text-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                Track an existing order →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
