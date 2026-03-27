"use client";

import { useState, useEffect, useCallback } from "react";
import { formatPrice } from "@/lib/utils";

interface GiftItem {
  _id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  imageUrl: string;
  giftedStatus: "none" | "item" | "cash";
  order: number;
}

interface Wish {
  _id: string;
  name: string;
  message: string;
  createdAt: string;
}

interface GiftBooking {
  _id: string;
  itemName: string;
  itemPrice: number;
  itemCurrency: string;
  giftType: "item" | "cash";
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
}

const STORAGE_KEY = "registry_admin_key";

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [inputKey, setInputKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");

  const [items, setItems] = useState<GiftItem[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [bookings, setBookings] = useState<GiftBooking[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [tab, setTab] = useState<"registry" | "wishes" | "bookings">("registry");

  // Add-item form state
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    currency: "USD",
    imageUrl: "",
    order: "0",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<GiftItem>>({});

  // ── Restore session ──
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setAdminKey(saved);
      setAuthed(true);
    }
  }, []);

  // ── Auth ──
  const handleLogin = async () => {
    setAuthError("");
    // Verify by making a POST probe with zero-data — a 401 means wrong key, 400 means right key
    const res = await fetch("/api/registry/items", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": inputKey },
      body: JSON.stringify({}),
    });
    if (res.status === 401) {
      setAuthError("Incorrect password. Please try again.");
      return;
    }
    // 400 or 201 both mean key is valid
    if (res.status === 400 || res.status === 201) {
      sessionStorage.setItem(STORAGE_KEY, inputKey);
      setAdminKey(inputKey);
      setAuthed(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAdminKey("");
    setAuthed(false);
    setInputKey("");
  };

  // ── Fetch data ──
  const fetchItems = useCallback(async () => {
    setLoadingItems(true);
    const res = await fetch("/api/registry/items");
    const data = await res.json();
    setItems(data);
    setLoadingItems(false);
  }, []);

  const fetchWishes = useCallback(async () => {
    const res = await fetch("/api/get?page=1&limit=100");
    const data = await res.json();
    setWishes(data.wishes ?? []);
  }, []);

  const fetchBookings = useCallback(async (key: string) => {
    const res = await fetch("/api/registry/bookings", {
      headers: { "x-admin-key": key },
    });
    if (res.ok) {
      const data = await res.json();
      setBookings(data);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetchItems();
    fetchWishes();
    fetchBookings(adminKey);
  }, [authed, fetchItems, fetchWishes, fetchBookings, adminKey]);

  // ── Add item ──
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);

    const res = await fetch("/api/registry/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey,
      },
      body: JSON.stringify({
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        currency: newItem.currency,
        imageUrl: newItem.imageUrl,
        order: parseInt(newItem.order) || 0,
      }),
    });

    if (res.ok) {
      setNewItem({ name: "", description: "", price: "", currency: "USD", imageUrl: "", order: "0" });
      await fetchItems();
    } else {
      const data = await res.json();
      setAddError(data.error ?? "Failed to add item.");
    }
    setAddLoading(false);
  };

  // ── Update gifted status ──
  const handleStatusChange = async (id: string, status: GiftItem["giftedStatus"]) => {
    await fetch(`/api/registry/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ giftedStatus: status }),
    });
    await fetchItems();
  };

  // ── Delete item ──
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item from the registry?")) return;
    const res = await fetch(`/api/registry/items/${id}`, {
      method: "DELETE",
      headers: { "x-admin-key": adminKey },
    });
    if (res.ok) await fetchItems();
  };

  // ── Edit item ──
  const startEdit = (item: GiftItem) => {
    setEditingId(item._id);
    setEditForm({ name: item.name, description: item.description, price: item.price, currency: item.currency, imageUrl: item.imageUrl, order: item.order });
  };

  const saveEdit = async (id: string) => {
    await fetch(`/api/registry/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    await fetchItems();
  };

  // ── Login screen ──
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-sm">
          <h1 className="text-white text-2xl font-bold mb-2">Registry Admin</h1>
          <p className="text-white/40 text-sm mb-6">Enter the admin password to continue.</p>
          <input
            type="password"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Password"
            className="w-full p-3 rounded-xl bg-white/10 text-white border border-white/10 focus:border-amber-500/50 focus:outline-none mb-3"
          />
          {authError && <p className="text-red-400 text-sm mb-3">{authError}</p>}
          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-300 font-medium transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Registry Admin</h1>
          <p className="text-white/30 text-xs mt-0.5">Manage gift items and view wishes</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-6 mb-6 flex-wrap">
        {(["registry", "bookings", "wishes"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t
              ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
              : "text-white/40 hover:text-white/70"
              }`}
          >
            {t === "registry" ? "🎁 Gift Registry" : t === "bookings" ? `📋 Bookings (${bookings.length})` : "💌 Wishes"}
          </button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-20">
        {/* ── REGISTRY TAB ── */}
        {tab === "registry" && (
          <>
            {/* Add item form */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <h2 className="text-white font-semibold mb-4">Add New Item</h2>
              <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Item Name *" value={newItem.name} onChange={(v) => setNewItem({ ...newItem, name: v })} required />
                <Input label="Price *" value={newItem.price} onChange={(v) => setNewItem({ ...newItem, price: v })} type="number" required />
                <Input label="Currency" value={newItem.currency} onChange={(v) => setNewItem({ ...newItem, currency: v })} placeholder="USD" />
                <Input label="Display Order" value={newItem.order} onChange={(v) => setNewItem({ ...newItem, order: v })} type="number" />
                <div className="sm:col-span-2">
                  <ImageUploader
                    value={newItem.imageUrl}
                    adminKey={adminKey}
                    onChange={(url) => setNewItem({ ...newItem, imageUrl: url })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-white/40 mb-1">Description</label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    rows={2}
                    className="w-full p-2.5 rounded-lg bg-[#1a1a1a] text-white border border-white/10 focus:border-amber-500/40 focus:outline-none text-sm resize-none"
                  />
                </div>
                {addError && <p className="text-red-400 text-sm sm:col-span-2">{addError}</p>}
                <button
                  type="submit"
                  disabled={addLoading}
                  className="sm:col-span-2 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-300 font-medium text-sm transition-colors disabled:opacity-50"
                >
                  {addLoading ? "Adding..." : "+ Add Item"}
                </button>
              </form>
            </div>

            {/* Items list */}
            <h2 className="text-white font-semibold mb-4">Gift Items ({items.length})</h2>
            {loadingItems ? (
              <div className="text-white/30 text-center py-12">Loading...</div>
            ) : items.length === 0 ? (
              <div className="text-white/30 text-center py-12">No items yet. Add one above!</div>
            ) : (
              <div className="space-y-3">
                {items.map((item) =>
                  editingId === item._id ? (
                    <EditRow
                      key={item._id}
                      form={editForm}
                      onChange={setEditForm}
                      onSave={() => saveEdit(item._id)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <ItemRow
                      key={item._id}
                      item={item}
                      onStatusChange={handleStatusChange}
                      onEdit={() => startEdit(item)}
                      onDelete={() => handleDelete(item._id)}
                    />
                  )
                )}
              </div>
            )}
          </>
        )}

        {/* ── BOOKINGS TAB ── */}
        {tab === "bookings" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Gift Bookings ({bookings.length})</h2>
              <button
                onClick={() => fetchBookings(adminKey)}
                className="text-xs text-amber-400/60 hover:text-amber-400 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                Refresh
              </button>
            </div>
            {bookings.length === 0 ? (
              <div className="text-white/30 text-center py-12">No bookings yet.</div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => {
                  const price = formatPrice(b.itemPrice, b.itemCurrency || "USD");
                  return (
                    <div key={b._id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-white">{b.name}</p>
                            <span className={`text-[0.6rem] px-2 py-0.5 rounded-full border font-legan uppercase tracking-wider ${
                              b.giftType === "item"
                                ? "text-amber-300 border-amber-400/30 bg-amber-500/10"
                                : "text-blue-300 border-blue-400/30 bg-blue-500/10"
                            }`}>
                              {b.giftType === "item" ? "🎁 Item" : "💵 Cash"}
                            </span>
                          </div>
                          <p className="text-amber-300/80 text-xs font-mono mt-0.5">{b.itemName} &mdash; {price}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
                            <p className="text-white/50 text-xs">📞 {b.phone}</p>
                            {b.email && <p className="text-white/50 text-xs">✉️ {b.email}</p>}
                          </div>
                          {b.message && (
                            <p className="text-white/35 text-xs mt-1.5 italic">&ldquo;{b.message}&rdquo;</p>
                          )}
                        </div>
                        <p className="text-white/25 text-xs whitespace-nowrap">
                          {new Date(b.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── WISHES TAB ── */}
        {tab === "wishes" && (
          <>
            <h2 className="text-white font-semibold mb-4">Guest Wishes ({wishes.length})</h2>
            {wishes.length === 0 ? (
              <div className="text-white/30 text-center py-12">No wishes yet.</div>
            ) : (
              <div className="space-y-3">
                {wishes.map((w) => (
                  <div key={w._id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">{w.name}</p>
                        <p className="text-white/50 text-sm mt-1">{w.message}</p>
                      </div>
                      <p className="text-white/30 text-xs whitespace-nowrap">
                        {new Date(w.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──

function Input({
  label, value, onChange, type = "text", placeholder = "", required = false, className = ""
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs text-white/40 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full p-2.5 rounded-lg bg-[#1a1a1a] text-white border border-white/10 focus:border-amber-500/40 focus:outline-none text-sm"
      />
    </div>
  );
}

const STATUS_OPTIONS: { value: GiftItem["giftedStatus"]; label: string; color: string }[] = [
  { value: "none", label: "Not yet gifted", color: "text-white/50" },
  { value: "item", label: "Item gifted ✅", color: "text-green-400" },
  { value: "cash", label: "Cash received ✅", color: "text-blue-400" },
];

function ItemRow({
  item, onStatusChange, onEdit, onDelete
}: {
  item: GiftItem;
  onStatusChange: (id: string, s: GiftItem["giftedStatus"]) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      {item.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{item.name}</p>
        <p className="text-white/40 text-sm">{formatPrice(item.price, item.currency)}</p>
      </div>

      {/* Status selector */}
      <select
        value={item.giftedStatus}
        onChange={(e) => onStatusChange(item._id, e.target.value as GiftItem["giftedStatus"])}
        className={`bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none ${STATUS_OPTIONS.find((o) => o.value === item.giftedStatus)?.color ?? ""
          }`}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <div className="flex gap-2">
        <button onClick={onEdit} className="text-xs text-amber-400/70 hover:text-amber-400 transition-colors px-2 py-1 rounded border border-white/10 hover:border-amber-400/30">Edit</button>
        <button onClick={onDelete} className="text-xs text-red-400/70 hover:text-red-400 transition-colors px-2 py-1 rounded border border-white/10 hover:border-red-400/30">Delete</button>
      </div>
    </div>
  );
}

function EditRow({
  form, onChange, onSave, onCancel
}: {
  form: Partial<GiftItem>;
  onChange: (f: Partial<GiftItem>) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-amber-500/5 border border-amber-400/20 rounded-xl p-4 space-y-3">
      <p className="text-amber-300 text-xs font-medium uppercase tracking-wider">Editing item</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-white/40 mb-1">Name</label>
          <input value={form.name ?? ""} onChange={(e) => onChange({ ...form, name: e.target.value })} className="w-full p-2 rounded-lg bg-[#1a1a1a] text-white border border-white/10 text-sm focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1">Price</label>
          <input type="number" value={form.price ?? ""} onChange={(e) => onChange({ ...form, price: parseFloat(e.target.value) })} className="w-full p-2 rounded-lg bg-[#1a1a1a] text-white border border-white/10 text-sm focus:outline-none" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-white/40 mb-1">Image</label>
          <ImageUploader
            value={form.imageUrl ?? ""}
            adminKey={""}
            onChange={(url) => onChange({ ...form, imageUrl: url })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-white/40 mb-1">Description</label>
          <textarea value={form.description ?? ""} onChange={(e) => onChange({ ...form, description: e.target.value })} rows={2} className="w-full p-2 rounded-lg bg-[#1a1a1a] text-white border border-white/10 text-sm focus:outline-none resize-none" />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-sm text-white/40 hover:text-white/70 px-4 py-1.5 rounded-lg border border-white/10 transition-colors">Cancel</button>
        <button onClick={onSave} className="text-sm text-amber-300 px-4 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/30 hover:bg-amber-500/30 transition-colors">Save</button>
      </div>
    </div>
  );
}

// -- Image Uploader -----------------------------------------------------------

function ImageUploader({
  value,
  adminKey,
  onChange,
}: {
  value: string;
  adminKey: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFile = async (file: File) => {
    setUploadError("");
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/registry/upload", {
      method: "POST",
      headers: { "x-admin-key": adminKey },
      body: fd,
    });
    const data = await res.json();
    if (res.ok) {
      onChange(data.url);
    } else {
      setUploadError(data.error ?? "Upload failed");
    }
    setUploading(false);
  };

  return (
    <div>
      <label className="flex flex-col items-center justify-center gap-2 w-full h-24 rounded-xl border-2 border-dashed border-white/15 hover:border-amber-400/40 bg-[#1a1a1a] cursor-pointer transition-colors">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        {uploading ? (
          <div className="w-5 h-5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
        ) : (
          <>
            <span className="text-2xl">??</span>
            <span className="text-xs text-white/30">Click to upload an image from your computer</span>
          </>
        )}
      </label>

      {value && (
        <div className="mt-2 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="preview" className="w-14 h-14 rounded-lg object-cover ring-1 ring-white/10 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white/40 text-xs truncate">{value}</p>
            <button type="button" onClick={() => onChange("")} className="text-red-400/60 hover:text-red-400 text-xs mt-0.5 transition-colors">
              Remove
            </button>
          </div>
        </div>
      )}

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="...or paste an external image URL"
        className="mt-2 w-full p-2 rounded-lg bg-[#1a1a1a] text-white border border-white/10 text-xs focus:outline-none focus:border-amber-500/30 placeholder:text-white/20"
      />

      {uploadError && <p className="text-red-400 text-xs mt-1">{uploadError}</p>}
    </div>
  );
}

