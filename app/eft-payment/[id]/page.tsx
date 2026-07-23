"use client";

import { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Banknote, Copy, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import type { Order } from "@/lib/orders";

// TODO: Replace with your real bank details
const BANK = {
  bankName: "First National Bank (FNB)",
  accountName: "PS Store (Pty) Ltd",
  accountNumber: "62012345678",
  branchCode: "250655",
  accountType: "Cheque / Current",
};

function EftPaymentContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${id}?email=${encodeURIComponent(email)}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        setOrder(d.order ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, email]);

  async function submitProof() {
    if (!order) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`/api/orders/${order.id}/proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setConfirmed(true);
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  function copy(value: string, label: string) {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 size={32} className="animate-spin text-gray-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-400 mb-4">Order not found.</p>
        <Link href="/checkout" className="text-blue-400 hover:text-blue-300">
          Return to checkout
        </Link>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <CheckCircle size={80} className="text-green-400 mx-auto mb-6" />
        <h1 className="text-4xl font-black text-white mb-4">
          Payment Submitted!
        </h1>
        <p className="text-gray-400 text-lg mb-3">
          Thank you. We&apos;ll verify your EFT and process your order within
          1–2 business days.
        </p>
        <p className="text-gray-500 text-sm mb-10">
          Keep your reference{" "}
          <span className="text-white font-mono font-bold">{order.id}</span> as
          proof of payment.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/orders/${order.id}?email=${encodeURIComponent(order.customer.email)}`}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Track My Order
          </Link>
          <Link
            href="/products"
            className="border border-gray-700 hover:border-gray-500 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const details = [
    { label: "Bank", value: BANK.bankName },
    { label: "Account Name", value: BANK.accountName },
    { label: "Account Number", value: BANK.accountNumber, copy: true },
    { label: "Branch Code", value: BANK.branchCode, copy: true },
    { label: "Account Type", value: BANK.accountType },
    { label: "Reference", value: order.id, copy: true },
    {
      label: "Amount",
      value: `R${order.total.toFixed(2)}`,
      copy: true,
      highlight: true,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-3 mb-2">
        <Banknote size={32} className="text-green-400" />
        <h1 className="text-3xl font-black text-white">Pay via EFT</h1>
      </div>
      <p className="text-gray-400 mb-8">
        Transfer the exact amount using the details below. Use your Order ID as
        the payment reference.
      </p>

      {/* Order items summary */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl divide-y divide-gray-800 mb-6">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div>
              <p className="text-white font-medium text-sm">{item.name}</p>
              <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
            </div>
            <p className="text-white font-semibold text-sm">
              R{(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
        <div className="flex justify-between px-4 py-4 text-white font-black text-lg">
          <span>Total Due</span>
          <span>R{order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-bold text-base mb-4">
          Bank Account Details
        </h2>
        <div className="space-y-3">
          {details.map(({ label, value, copy: canCopy, highlight }) => (
            <div key={label} className="flex items-center justify-between py-1">
              <span className="text-gray-500 text-sm w-36 flex-shrink-0">
                {label}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-sm font-semibold ${
                    highlight ? "text-green-400" : "text-white"
                  }`}
                >
                  {value}
                </span>
                {canCopy && (
                  <button
                    onClick={() => copy(value, label)}
                    className="text-gray-600 hover:text-blue-400 transition-colors p-1"
                    title={`Copy ${label}`}
                  >
                    {copied === label ? (
                      <CheckCircle size={14} className="text-green-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-900/20 border border-amber-600/30 rounded-xl p-4 mb-6 text-sm text-amber-300">
        <strong>Important:</strong> Use{" "}
        <span className="font-mono font-bold">{order.id}</span> as your
        reference. Transfer exactly{" "}
        <span className="font-bold">R{order.total.toFixed(2)}</span> —
        payments without a matching reference may be delayed.
      </div>

      {/* Optional note / proof of payment */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4">
        <label className="block text-white font-semibold text-sm mb-1.5">
          Proof of Payment Note <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <p className="text-gray-500 text-xs mb-3">
          Add your bank reference number or any detail that helps us match your payment faster.
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="e.g. Payment ref: FNB123456789, made on 23 Jul at 10:30"
          className="w-full bg-gray-800 border border-gray-700 focus:border-green-500 text-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm placeholder-gray-600 resize-none"
        />
      </div>

      {submitError && (
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm mb-4">
          <AlertCircle size={16} className="flex-shrink-0" />
          {submitError}
        </div>
      )}

      <button
        onClick={submitProof}
        disabled={submitting}
        className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-base transition-colors flex items-center justify-center gap-3"
      >
        {submitting ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <CheckCircle size={20} />
        )}
        {submitting ? "Submitting..." : "I've Made the Payment"}
      </button>

      <p className="text-center text-gray-600 text-sm mt-4">
        Orders are processed once payment is verified (1–2 business days).
      </p>

      <div className="text-center mt-3">
        <Link
          href="/checkout"
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
        >
          ← Try card payment instead
        </Link>
      </div>
    </div>
  );
}

export default function EftPaymentPage({
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
      <EftPaymentContent id={id} />
    </Suspense>
  );
}
