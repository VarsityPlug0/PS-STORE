"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  Send,
  Loader2,
  Package,
  Truck,
  User,
  CreditCard,
  FileText,
  MessageCircle,
} from "lucide-react";
import type { Order, OrderStatus } from "@/lib/orders";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-900/40 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-900/40 text-blue-400 border-blue-500/30",
  processing: "bg-purple-900/40 text-purple-400 border-purple-500/30",
  shipped: "bg-orange-900/40 text-orange-400 border-orange-500/30",
  delivered: "bg-green-900/40 text-green-400 border-green-500/30",
  cancelled: "bg-red-900/40 text-red-400 border-red-500/30",
};

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
        <Icon size={16} className="text-gray-400" />
        <h2 className="text-white font-bold text-sm">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function AdminOrderDetailClient({
  initialOrder,
}: {
  initialOrder: Order;
}) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<"overview" | "manage" | "messages">(
    "overview"
  );

  // Manage form state
  const [manage, setManage] = useState({
    status: order.status,
    paymentStatus: order.paymentStatus,
    trackingNumber: order.trackingNumber ?? "",
    trackingCarrier: order.trackingCarrier ?? "",
    adminNotes: order.adminNotes ?? "",
  });

  async function saveManage() {
    setSaving("manage");
    const res = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: manage.status,
        paymentStatus: manage.paymentStatus,
        trackingNumber: manage.trackingNumber || undefined,
        trackingCarrier: manage.trackingCarrier || undefined,
        adminNotes: manage.adminNotes || undefined,
      }),
    });
    const data = await res.json();
    if (res.ok) setOrder(data.order);
    setSaving(null);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    const res = await fetch(`/api/orders/${order.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setOrder(data.order);
      setMessage("");
    }
    setSending(false);
  }

  const customerMsgCount = order.messages.filter(
    (m) => m.from === "customer"
  ).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back + Header */}
      <Link
        href="/admin/orders"
        className="flex items-center gap-1 text-gray-500 hover:text-white transition-colors text-sm mb-6"
      >
        <ChevronLeft size={16} /> All Orders
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">{order.id}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date(order.createdAt).toLocaleDateString("en-ZA", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span
          className={`inline-flex items-center border text-sm font-semibold px-3 py-1.5 rounded-full capitalize ${STATUS_COLORS[order.status] ?? ""}`}
        >
          {order.status}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800 mb-6">
        {(
          [
            { key: "overview", label: "Overview" },
            { key: "manage", label: "Manage" },
            {
              key: "messages",
              label: "Messages",
              badge: customerMsgCount,
            },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors -mb-px ${
              tab === t.key
                ? "text-white border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {t.label}
            {"badge" in t && t.badge > 0 && (
              <span className="ml-1.5 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Section title="Customer" icon={User}>
            <div className="space-y-2 text-sm">
              <p className="text-white font-semibold">{order.customer.name}</p>
              <p>
                <a
                  href={`mailto:${order.customer.email}`}
                  className="text-blue-400 hover:underline"
                >
                  {order.customer.email}
                </a>
              </p>
              <p className="text-gray-400">
                <a href={`tel:${order.customer.phone}`}>
                  {order.customer.phone}
                </a>
              </p>
              <div className="pt-2 border-t border-gray-800 mt-2">
                <p className="text-gray-300">{order.customer.address}</p>
                <p className="text-gray-400">
                  {order.customer.city}, {order.customer.province}
                </p>
                <p className="text-gray-400">{order.customer.postalCode}</p>
              </div>
            </div>
          </Section>

          <Section title="Payment" icon={CreditCard}>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="text-white font-semibold uppercase">
                  {order.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span
                  className={`font-semibold capitalize ${
                    order.paymentStatus === "paid"
                      ? "text-green-400"
                      : order.paymentStatus === "failed"
                        ? "text-red-400"
                        : "text-yellow-400"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="text-white font-black text-base">
                  R{order.total.toFixed(2)}
                </span>
              </div>
              {order.stripeSessionId && (
                <div className="pt-2 border-t border-gray-800">
                  <p className="text-gray-600 text-xs break-all">
                    Stripe: {order.stripeSessionId}
                  </p>
                </div>
              )}
            </div>
          </Section>

          <Section title="Items" icon={Package}>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {item.name}
                    </p>
                    <p className="text-gray-500 text-xs">× {item.quantity}</p>
                  </div>
                  <p className="text-white text-sm font-semibold flex-shrink-0">
                    R{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Shipping" icon={Truck}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="text-white capitalize">{order.status}</span>
              </div>
              {order.trackingNumber ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tracking</span>
                    <span className="text-white font-mono">
                      {order.trackingNumber}
                    </span>
                  </div>
                  {order.trackingCarrier && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Carrier</span>
                      <span className="text-white">{order.trackingCarrier}</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-600 text-xs pt-1">
                  No tracking info added yet.
                </p>
              )}
            </div>
          </Section>

          {order.adminNotes && (
            <div className="md:col-span-2">
              <Section title="Admin Notes" icon={FileText}>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {order.adminNotes}
                </p>
              </Section>
            </div>
          )}
        </div>
      )}

      {/* MANAGE TAB */}
      {tab === "manage" && (
        <div className="space-y-4">
          <Section title="Order Status" icon={Package}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">
                  Order Status
                </label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 text-white rounded-xl px-4 py-2.5 outline-none text-sm"
                  value={manage.status}
                  onChange={(e) =>
                    setManage((m) => ({
                      ...m,
                      status: e.target.value as OrderStatus,
                    }))
                  }
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">
                  Payment Status
                </label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 text-white rounded-xl px-4 py-2.5 outline-none text-sm"
                  value={manage.paymentStatus}
                  onChange={(e) =>
                    setManage((m) => ({
                      ...m,
                      paymentStatus: e.target.value as
                        | "pending"
                        | "paid"
                        | "failed",
                    }))
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </Section>

          <Section title="Shipping & Tracking" icon={Truck}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">
                  Tracking Number
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 text-white rounded-xl px-4 py-2.5 outline-none text-sm font-mono"
                  placeholder="e.g. CDE123456789ZA"
                  value={manage.trackingNumber}
                  onChange={(e) =>
                    setManage((m) => ({
                      ...m,
                      trackingNumber: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">
                  Carrier / Courier
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 text-white rounded-xl px-4 py-2.5 outline-none text-sm"
                  placeholder="e.g. Courier Guy, PostNet"
                  value={manage.trackingCarrier}
                  onChange={(e) =>
                    setManage((m) => ({
                      ...m,
                      trackingCarrier: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </Section>

          <Section title="Internal Notes" icon={FileText}>
            <textarea
              className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 text-white rounded-xl px-4 py-2.5 outline-none text-sm resize-none"
              rows={4}
              placeholder="Notes visible only to admins..."
              value={manage.adminNotes}
              onChange={(e) =>
                setManage((m) => ({ ...m, adminNotes: e.target.value }))
              }
            />
          </Section>

          <button
            onClick={saveManage}
            disabled={saving === "manage"}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors"
          >
            {saving === "manage" ? (
              <Loader2 size={18} className="animate-spin" />
            ) : null}
            {saving === "manage" ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* MESSAGES TAB */}
      {tab === "messages" && (
        <Section title="Messages with Customer" icon={MessageCircle}>
          <div className="mb-4">
            <p className="text-gray-500 text-sm mb-1">
              Customer:{" "}
              <span className="text-gray-300">{order.customer.name}</span>
            </p>
            <a
              href={`mailto:${order.customer.email}`}
              className="text-blue-400 hover:underline text-sm"
            >
              {order.customer.email}
            </a>
          </div>

          {order.messages.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-8">
              No messages yet.
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto mb-4 pr-1">
              {order.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.from === "admin" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.from === "admin"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-gray-800 text-gray-200 rounded-bl-sm"
                    }`}
                  >
                    <p className="text-[10px] font-semibold mb-1 opacity-70">
                      {msg.from === "admin" ? "You (Admin)" : order.customer.name}
                    </p>
                    <p className="leading-relaxed">{msg.text}</p>
                    <p className="text-[10px] mt-1 opacity-60">
                      {new Date(msg.at).toLocaleString("en-ZA", {
                        day: "numeric",
                        month: "short",
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
              className="flex-1 bg-gray-800 border border-gray-700 focus:border-blue-500 text-white rounded-xl px-4 py-2.5 outline-none text-sm placeholder-gray-600"
              placeholder={`Message to ${order.customer.name}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors"
            >
              {sending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>
        </Section>
      )}
    </div>
  );
}
