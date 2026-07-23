"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  ChevronRight,
  LogOut,
  ShoppingBag,
  Filter,
} from "lucide-react";
import type { Order, OrderStatus } from "@/lib/orders";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-900/40 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-900/40 text-blue-400 border-blue-500/30",
  processing: "bg-purple-900/40 text-purple-400 border-purple-500/30",
  shipped: "bg-orange-900/40 text-orange-400 border-orange-500/30",
  delivered: "bg-green-900/40 text-green-400 border-green-500/30",
  cancelled: "bg-red-900/40 text-red-400 border-red-500/30",
};

const FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "EFT Submitted", value: "eft_submitted" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export default function AdminOrdersClient({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  const eftSubmitted = initialOrders.filter(
    (o) => o.paymentMethod === "eft" && o.paymentStatus === "submitted"
  );

  const filtered =
    filter === "all"
      ? initialOrders
      : filter === "eft_submitted"
        ? eftSubmitted
        : initialOrders.filter((o) => o.status === filter);

  const counts = FILTERS.reduce(
    (acc, f) => {
      if (f.value === "all") acc[f.value] = initialOrders.length;
      else if (f.value === "eft_submitted") acc[f.value] = eftSubmitted.length;
      else acc[f.value] = initialOrders.filter((o) => o.status === f.value).length;
      return acc;
    },
    {} as Record<string, number>
  );

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Orders</h1>
          <p className="text-gray-400 mt-1">
            {initialOrders.length} total orders
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <ShoppingBag size={16} /> Products
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "EFT to Verify",
            value: counts["eft_submitted"],
            color: counts["eft_submitted"] > 0 ? "text-amber-400" : "text-gray-500",
            highlight: counts["eft_submitted"] > 0,
          },
          {
            label: "New Orders",
            value: counts["pending"] + counts["confirmed"],
            color: "text-blue-400",
            highlight: false,
          },
          {
            label: "Shipped",
            value: counts["shipped"],
            color: "text-orange-400",
            highlight: false,
          },
          {
            label: "Delivered",
            value: counts["delivered"],
            color: "text-green-400",
            highlight: false,
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`bg-gray-900 border rounded-2xl p-4 ${s.highlight ? "border-amber-500/40 bg-amber-900/10" : "border-gray-800"}`}
          >
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-sm mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
        <Filter size={14} className="text-gray-600 flex-shrink-0 mr-1" />
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`flex-shrink-0 text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === f.value
                ? f.value === "eft_submitted"
                  ? "bg-amber-500 text-white"
                  : "bg-blue-600 text-white"
                : f.value === "eft_submitted" && counts[f.value] > 0
                  ? "text-amber-400 hover:text-white hover:bg-amber-900/40 ring-1 ring-amber-500/40"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {f.label}
            {counts[f.value] > 0 && (
              <span
                className={`ml-1.5 text-xs ${
                  filter === f.value
                    ? "text-white/70"
                    : f.value === "eft_submitted"
                      ? "text-amber-400 font-bold"
                      : "text-gray-600"
                }`}
              >
                {counts[f.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders table */}
      {filtered.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl py-16 text-center">
          <Package size={48} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No orders in this category yet.</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 font-medium text-xs uppercase tracking-wide px-5 py-3">
                  Order
                </th>
                <th className="text-left text-gray-500 font-medium text-xs uppercase tracking-wide px-5 py-3 hidden sm:table-cell">
                  Customer
                </th>
                <th className="text-left text-gray-500 font-medium text-xs uppercase tracking-wide px-5 py-3 hidden md:table-cell">
                  Total
                </th>
                <th className="text-left text-gray-500 font-medium text-xs uppercase tracking-wide px-5 py-3">
                  Status
                </th>
                <th className="text-left text-gray-500 font-medium text-xs uppercase tracking-wide px-5 py-3 hidden lg:table-cell">
                  Payment
                </th>
                <th className="text-left text-gray-500 font-medium text-xs uppercase tracking-wide px-5 py-3 hidden lg:table-cell">
                  Date
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  className={`transition-colors cursor-pointer ${
                    order.paymentMethod === "eft" && order.paymentStatus === "submitted"
                      ? "bg-amber-900/10 hover:bg-amber-900/20 border-l-2 border-amber-500"
                      : "hover:bg-gray-800/40"
                  }`}
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                >
                  <td className="px-5 py-4">
                    <p className="text-white font-mono font-semibold text-sm">
                      {order.id}
                    </p>
                    <p className="text-gray-600 text-xs mt-0.5 sm:hidden">
                      {order.customer.name}
                    </p>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <p className="text-white text-sm font-medium">
                      {order.customer.name}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {order.customer.email}
                    </p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-white font-semibold text-sm">
                      R{order.total.toFixed(2)}
                    </p>
                    <p className="text-gray-600 text-xs mt-0.5">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center border text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] ?? "bg-gray-800 text-gray-400 border-gray-700"}`}
                    >
                      {order.status}
                    </span>
                    {order.messages.length > 0 && (
                      <span className="ml-1.5 inline-flex items-center justify-center bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full">
                        {order.messages.filter((m) => m.from === "customer")
                          .length > 0
                          ? order.messages.filter((m) => m.from === "customer")
                              .length
                          : null}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span
                      className={`text-xs font-medium capitalize ${
                        order.paymentStatus === "paid"
                          ? "text-green-400"
                          : order.paymentStatus === "submitted"
                            ? "text-amber-400 font-bold"
                            : order.paymentStatus === "failed"
                              ? "text-red-400"
                              : "text-yellow-400"
                      }`}
                    >
                      {order.paymentMethod.toUpperCase()} ·{" "}
                      {order.paymentStatus === "submitted" ? "proof submitted" : order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell text-gray-500 text-xs">
                    {new Date(order.createdAt).toLocaleDateString("en-ZA", {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <ChevronRight size={16} className="text-gray-600" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
