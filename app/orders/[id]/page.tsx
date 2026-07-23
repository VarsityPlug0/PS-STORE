"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Truck,
  MessageCircle,
  Send,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import type { Order } from "@/lib/orders";
import { Suspense } from "react";

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: "📋" },
  { key: "confirmed", label: "Payment Confirmed", icon: "✅" },
  { key: "processing", label: "Being Prepared", icon: "📦" },
  { key: "shipped", label: "On Its Way", icon: "🚚" },
  { key: "delivered", label: "Delivered", icon: "🏠" },
];

function statusIndex(status: string) {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-900/40 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-900/40 text-blue-400 border-blue-500/30",
  processing: "bg-purple-900/40 text-purple-400 border-purple-500/30",
  shipped: "bg-orange-900/40 text-orange-400 border-orange-500/30",
  delivered: "bg-green-900/40 text-green-400 border-green-500/30",
  cancelled: "bg-red-900/40 text-red-400 border-red-500/30",
};

function OrderDetailContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}?email=${encodeURIComponent(email)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((d) => {
        setOrder(d.order);
        setLoading(false);
      })
      .catch(() => {
        setError("Order not found or email doesn't match.");
        setLoading(false);
      });
  }, [id, email]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);

    const res = await fetch(`/api/orders/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message.trim(), email }),
    });
    const data = await res.json();
    if (res.ok) {
      setOrder(data.order);
      setMessage("");
    }
    setSending(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 size={32} className="animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-400 mb-4">{error || "Order not found."}</p>
        <Link href="/track" className="text-blue-400 hover:text-blue-300">
          ← Track another order
        </Link>
      </div>
    );
  }

  const current = statusIndex(order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link
        href="/track"
        className="flex items-center gap-1 text-gray-500 hover:text-white transition-colors text-sm mb-8"
      >
        <ChevronLeft size={16} /> Back to tracking
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">{order.id}</h1>
          <p className="text-gray-500 text-sm mt-1">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-ZA", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <span
          className={`inline-flex items-center border text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${STATUS_COLORS[order.status] ?? "bg-gray-800 text-gray-400 border-gray-700"}`}
        >
          {order.status}
        </span>
      </div>

      {/* Timeline */}
      {order.status !== "cancelled" && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold mb-6">Order Progress</h2>
          <div className="space-y-0">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= current;
              const active = i === current;
              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base border-2 ${
                        done
                          ? active
                            ? "bg-blue-600 border-blue-600"
                            : "bg-blue-500/20 border-blue-500"
                          : "bg-gray-800 border-gray-700"
                      }`}
                    >
                      {done ? (
                        <span>{step.icon}</span>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-700" />
                      )}
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div
                        className={`w-0.5 h-8 ${i < current ? "bg-blue-500" : "bg-gray-800"}`}
                      />
                    )}
                  </div>
                  <div className="pb-8 pt-1.5">
                    <p
                      className={`text-sm font-semibold ${done ? "text-white" : "text-gray-600"}`}
                    >
                      {step.label}
                    </p>
                    {active && (
                      <p className="text-blue-400 text-xs mt-0.5">Current status</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tracking */}
      {order.trackingNumber && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6 flex items-center gap-4">
          <Truck size={24} className="text-orange-400 flex-shrink-0" />
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">
              Tracking Number
            </p>
            <p className="text-white font-mono font-bold">
              {order.trackingNumber}
            </p>
            {order.trackingCarrier && (
              <p className="text-gray-500 text-xs mt-0.5">
                {order.trackingCarrier}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-gray-400" />
            <h2 className="text-white font-bold">
              Items ({order.items.length})
            </h2>
          </div>
        </div>
        <div className="divide-y divide-gray-800">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{item.name}</p>
                <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
              </div>
              <p className="text-white font-semibold text-sm">
                R{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-gray-800 flex justify-between text-white font-black">
          <span>Total</span>
          <span>R{order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
        <h2 className="text-white font-bold mb-3">Shipping To</h2>
        <p className="text-gray-300 text-sm">{order.customer.name}</p>
        <p className="text-gray-400 text-sm">{order.customer.address}</p>
        <p className="text-gray-400 text-sm">
          {order.customer.city}, {order.customer.province}{" "}
          {order.customer.postalCode}
        </p>
      </div>

      {/* Messages */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
          <MessageCircle size={18} className="text-gray-400" />
          <h2 className="text-white font-bold">Messages</h2>
        </div>
        <div className="p-5">
          {order.messages.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-4">
              No messages yet. You can send us a message below.
            </p>
          ) : (
            <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
              {order.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.from === "customer" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.from === "customer"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-gray-800 text-gray-200 rounded-bl-sm"
                    }`}
                  >
                    {msg.from === "admin" && (
                      <p className="text-[10px] font-semibold text-gray-500 mb-1">
                        PS Store Support
                      </p>
                    )}
                    <p className="leading-relaxed">{msg.text}</p>
                    <p
                      className={`text-[10px] mt-1 ${msg.from === "customer" ? "text-blue-200" : "text-gray-600"}`}
                    >
                      {new Date(msg.at).toLocaleTimeString("en-ZA", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              className="flex-1 bg-gray-800 border border-gray-700 focus:border-blue-500 text-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm placeholder-gray-600"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-colors"
            >
              {sending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-40">
          <Loader2 size={32} className="animate-spin text-gray-500" />
        </div>
      }
    >
      <OrderDetailContent id={id} />
    </Suspense>
  );
}
