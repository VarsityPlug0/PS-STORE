"use client";

import { useState } from "react";
import { Product } from "@/lib/products";
import { Pencil, Trash2, Plus, X, Check, LogOut, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  image: "",
  category: "Console",
  stock: "",
  specs: "",
};

export default function AdminProductsClient({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      image: p.image,
      category: p.category,
      stock: String(p.stock),
      specs: p.specs.join(", "),
    });
    setEditingId(p.id);
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      image: form.image,
      category: form.category,
      stock: parseInt(form.stock, 10),
      specs: form.specs.split(",").map((s) => s.trim()).filter(Boolean),
    };

    if (editingId) {
      const res = await fetch(`/api/admin/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setProducts((prev) =>
        prev.map((p) => (p.id === editingId ? data.product : p))
      );
    } else {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setProducts((prev) => [...prev, data.product]);
    }

    setSaving(false);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    setDeletingId(id);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeletingId(null);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Admin Panel</h1>
          <p className="text-gray-400 mt-1">{products.length} products</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Package size={16} /> Orders
          </Link>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={16} /> Add Product
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 font-semibold text-sm px-6 py-4">Product</th>
              <th className="text-left text-gray-400 font-semibold text-sm px-6 py-4">Category</th>
              <th className="text-left text-gray-400 font-semibold text-sm px-6 py-4">Price</th>
              <th className="text-left text-gray-400 font-semibold text-sm px-6 py-4">Stock</th>
              <th className="text-right text-gray-400 font-semibold text-sm px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                      <Image src={p.image} alt={p.name} fill className="object-cover" unoptimized />
                    </div>
                    <span className="text-white font-medium text-sm">{p.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-blue-600/20 text-blue-400 text-xs font-semibold px-2 py-1 rounded-full">
                    {p.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-white font-semibold">${p.price.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-medium ${p.stock > 0 ? "text-green-400" : "text-red-400"}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">
                {editingId ? "Edit Product" : "Add Product"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {[
                { label: "Name", key: "name", type: "text", required: true },
                { label: "Image URL", key: "image", type: "url", required: true },
                { label: "Price", key: "price", type: "number", required: true },
                { label: "Stock", key: "stock", type: "number", required: true },
                { label: "Specs (comma separated)", key: "specs", type: "text", required: false },
              ].map(({ label, key, type, required }) => (
                <div key={key}>
                  <label className="block text-gray-400 text-sm mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    required={required}
                    step={key === "price" ? "0.01" : undefined}
                    className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 text-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm"
                  />
                </div>
              ))}

              <div>
                <label className="block text-gray-400 text-sm mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 text-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm"
                >
                  <option>Console</option>
                  <option>Controller</option>
                  <option>Accessory</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  required
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 text-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  <Check size={16} />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
