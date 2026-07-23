"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Package, ChevronRight, Loader2 } from "lucide-react";
import type { Order } from "@/lib/orders";

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed" },
  { key: "confirmed", label: "Payment Confirmed" },
  { key: "processing", label: "Being Prepared" },
  { key: "shipped", label: "On Its Way" },
  { key: "delivered", label: "Delivered" },
];

function statusIndex(status: string) {
  const i = STATUS_STEPS.findIndex((s) => s.key === status);
  return i === -1 ? 0 : i;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-900/40 text-yellow-400 border-yellow-500/30",
    confirmed: "bg-blue-900/40 text-blue-400 border-blue-500/30",
    processing: "bg-purple-900/40 text-purple-400 border-purple-500/30",
    shipped: "bg-orange-900/40 text-orange-400 border-orange-500/30",
    delivered: "bg-green-900/40 text-green-400 border-green-500/30",
    cancelled: "bg-red-900/40 text-red-400 border-red-500/30",
  };
  return (
    <span
      className={`inline-flex items-center border text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${colors[status] ?? "bg-gray-800 text-gray-400 border-gray-700"}`}
    >
      {status}
    </span>
  );
}

function OrderTimeline({ order }: { order: Order }) {
  if (order.status === "cancelled") {
    return (
      <div className="text-center py-4 text-red-400 font-medium">
        This order has been cancelled.
      </div>
    );
  }
  const current = statusIndex(order.status);
  return (
    <div className="flex items-start gap-0 mt-4">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <div key={step.key} className="flex-1 flex flex-col items-center">
            <div className="flex items-center w-full">
              {i > 0 && (
                <div
                  className={`flex-1 h-0.5 ${done ? "bg-blue-500" : "bg-gray-700"}`}
                />
              )}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                  done
                    ? active
                      ? "bg-blue-600 border-blue-600"
                      : "bg-blue-500/20 border-blue-500"
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                {done ? (
                  <svg
                    className="w-4 h-4 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-600" />
                )}
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 ${i < current ? "bg-blue-500" : "bg-gray-700"}`}
                />
              )}
            </div>
            <p
              className={`text-[10px] font-medium mt-1.5 text-center leading-tight ${done ? "text-blue-400" : "text-gray-600"}`}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default function TrackPage() {
  const [form, setForm] = useState({ orderId: "", email: "" });
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrders(null);

    try {
      // Try by order ID first
      if (form.orderId.trim()) {
        const res = await fetch(
          `/api/orders/${form.orderId.trim().toUpperCase()}?email=${encodeURIComponent(form.email)}`
        );
        if (res.ok) {
          const data = await res.json();
          setOrders(data.order ? [data.order] : []);
          setLoading(false);
          return;
        }
      }

      // Fall back to email lookup
      if (form.email.trim()) {
        const res = await fetch(
          `/api/orders?email=${encodeURIComponent(form.email.trim())}`
        );
        const data = await res.json();
        setOrders(data.orders ?? []);
        setLoading(false);
        return;
      }

      setError("Please enter your Order ID or email address.");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/20 rounded-2xl mb-4">
          <Package size={32} className="text-blue-400" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Track Your Order</h1>
        <p className="text-gray-400">
          Enter your Order ID and email to see your order status.
        </p>
      </div>

      <form
        onSubmit={search}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            Order ID
          </label>
          <input
            type="text"
            className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 text-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm placeholder-gray-600 font-mono"
            placeholder="PS-XXXXXXXX"
            value={form.orderId}
            onChange={(e) =>
              setForm((f) => ({ ...f, orderId: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 text-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm placeholder-gray-600"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || (!form.orderId.trim() && !form.email.trim())}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}
          {loading ? "Searching..." : "Track Order"}
        </button>
      </form>

      {orders !== null && (
        <div>
          {orders.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No orders found. Check your Order ID or email and try again.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-white font-mono font-bold">
                        {order.id}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("en-ZA", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <OrderTimeline order={order} />

                  {order.trackingNumber && (
                    <div className="mt-4 bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-xs">Tracking Number</p>
                        <p className="text-white font-mono font-semibold">
                          {order.trackingNumber}
                        </p>
                      </div>
                      {order.trackingCarrier && (
                        <span className="text-gray-400 text-sm">
                          {order.trackingCarrier}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                    <p className="text-gray-400 text-sm">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""} · R
                      {order.total.toFixed(2)}
                    </p>
                    <Link
                      href={`/orders/${order.id}?email=${encodeURIComponent(order.customer.email)}`}
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      View Details <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
