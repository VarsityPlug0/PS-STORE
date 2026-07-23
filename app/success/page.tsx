"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Loader2 } from "lucide-react";
import type { Order } from "@/lib/orders";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("order_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!orderId);

  useEffect(() => {
    if (!orderId) return;

    // Mark order as paid
    fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "confirmed", paymentStatus: "paid" }),
    })
      .then((r) => r.json())
      .then((d) => {
        setOrder(d.order ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 size={32} className="animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <CheckCircle size={80} className="text-green-400 mx-auto mb-6" />
      <h1 className="text-4xl font-black text-white mb-4">Order Confirmed!</h1>

      {order ? (
        <>
          <p className="text-gray-400 mb-2">
            Thank you, {order.customer.name.split(" ")[0]}! Your payment was
            successful.
          </p>
          <p className="text-gray-500 text-sm mb-2">
            A confirmation will be sent to{" "}
            <span className="text-gray-300">{order.customer.email}</span>
          </p>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 my-8 text-left">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide">
                  Order ID
                </p>
                <p className="text-white font-mono font-bold text-lg">
                  {order.id}
                </p>
              </div>
              <span className="bg-green-900/40 text-green-400 border border-green-500/30 text-xs font-semibold px-3 py-1 rounded-full">
                Paid
              </span>
            </div>
            <div className="border-t border-gray-800 pt-4 space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    {item.name}{" "}
                    <span className="text-gray-600">× {item.quantity}</span>
                  </span>
                  <span className="text-white font-medium">
                    R{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t border-gray-800 pt-2 flex justify-between font-bold text-white">
                <span>Total</span>
                <span>R{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/orders/${order.id}?email=${encodeURIComponent(order.customer.email)}`}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              <Package size={18} />
              Track My Order
            </Link>
            <Link
              href="/products"
              className="border border-gray-700 hover:border-gray-500 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="text-gray-400 text-lg mb-10">
            Thank you for your purchase. You will receive a confirmation email
            shortly.
          </p>
          <Link
            href="/products"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            Continue Shopping
          </Link>
        </>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-40">
          <Loader2 size={32} className="animate-spin text-gray-500" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
