"use client";

import { useState } from "react";
import { config } from "@/lib/config";
import { formatPrice } from "@/lib/utils";

interface GiftItem {
  _id: string;
  name: string;
  price: number;
  currency: string;
}

interface Props {
  item: GiftItem;
  onClose: () => void;
}

export default function GiftBookingModal({ item, onClose }: Props) {
  const [giftType, setGiftType] = useState<"item" | "cash">("item");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const price = formatPrice(item.price, item.currency || "USD");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/registry/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: item._id,
        itemName: item.name,
        itemPrice: item.price,
        itemCurrency: item.currency,
        giftType,
        name,
        phone,
        email,
        message,
      }),
    });
    if (res.ok) {
      setSubmitted(true);
    } else {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const { account1, account2 } = config.bank;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#111] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-[#111] border-b border-white/10 px-5 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.55rem] font-legan tracking-[0.25em] uppercase text-amber-300/60 mb-0.5">Gift Booking</p>
            <h2 className="font-ovo text-white text-base leading-tight truncate">{item.name}</h2>
            <p className="text-amber-300 text-xs font-mono mt-0.5">{price}</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 text-2xl leading-none flex-shrink-0 mt-0.5">×</button>
        </div>

        {submitted ? (
          /* ── Success screen ── */
          <div className="px-5 py-8 text-center">
            <p className="text-4xl mb-3">🎉</p>
            <h3 className="font-ovo text-white text-lg mb-2">JazakAllahu Khayran!</h3>
            <p className="text-white/50 text-xs font-legan mb-6 leading-relaxed">
              Thank you, <span className="text-white font-medium">{name}</span>! We&apos;ve recorded your booking for{" "}
              <span className="text-amber-300 italic">{item.name}</span>.{" "}
              {giftType === "item"
                ? "We'll reach out to share delivery details shortly. 📦"
                : "Please transfer the amount using the details below. 💛"}
            </p>

            {giftType === "cash" && account1.bankName && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left space-y-2 mb-5">
                <p className="text-[0.55rem] font-legan tracking-widest uppercase text-white/35 mb-3">Transfer Details</p>
                <BankRow label="Bank" value={account1.bankName} />
                <BankRow label="Account Name" value={account1.accountName} />
                <BankRow label="Account No." value={account1.accountNumber} copyable />
                {account2.bankName && (
                  <>
                    <hr className="border-white/10 my-2" />
                    <BankRow label="Alt. Bank" value={account2.bankName} />
                    <BankRow label="Account Name" value={account2.accountName} />
                    <BankRow label="Account No." value={account2.accountNumber} copyable />
                  </>
                )}
                <p className="text-white/30 text-[0.6rem] font-legan pt-2 text-center">
                  Please include &ldquo;{item.name}&rdquo; as the transfer note.
                </p>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 text-sm font-legan hover:bg-amber-500/30 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          /* ── Booking Form ── */
          <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">

            {/* Gift type toggle */}
            <div>
              <p className="text-[0.55rem] font-legan tracking-widest uppercase text-white/35 mb-2">I would like to give</p>
              <div className="grid grid-cols-2 gap-2">
                {(["item", "cash"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setGiftType(t)}
                    className={`py-2.5 rounded-xl text-[0.65rem] font-legan border transition-colors ${
                      giftType === t
                        ? "bg-amber-500/20 border-amber-400/40 text-amber-300"
                        : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
                    }`}
                  >
                    {t === "item" ? "🎁 The Item" : "💵 Cash Equivalent"}
                  </button>
                ))}
              </div>
              <p className="text-white/30 text-[0.6rem] font-legan mt-1.5">
                {giftType === "item"
                  ? "We'll send you delivery details after confirming."
                  : "Bank details will be shown after you submit."}
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-[0.55rem] font-legan tracking-widest uppercase text-white/35 mb-1">Your Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Full name"
                className="w-full p-2.5 rounded-lg bg-white/5 text-white border border-white/10 focus:border-amber-400/40 focus:outline-none text-sm font-legan placeholder:text-white/20"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[0.55rem] font-legan tracking-widest uppercase text-white/35 mb-1">Phone Number *</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                type="tel"
                placeholder="+234 000 000 0000"
                className="w-full p-2.5 rounded-lg bg-white/5 text-white border border-white/10 focus:border-amber-400/40 focus:outline-none text-sm font-legan placeholder:text-white/20"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[0.55rem] font-legan tracking-widest uppercase text-white/35 mb-1">Email <span className="normal-case">(optional)</span></label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="your@email.com"
                className="w-full p-2.5 rounded-lg bg-white/5 text-white border border-white/10 focus:border-amber-400/40 focus:outline-none text-sm font-legan placeholder:text-white/20"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-[0.55rem] font-legan tracking-widest uppercase text-white/35 mb-1">Message <span className="normal-case">(optional)</span></label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                placeholder="A kind word for the couple…"
                className="w-full p-2.5 rounded-lg bg-white/5 text-white border border-white/10 focus:border-amber-400/40 focus:outline-none text-xs font-legan resize-none placeholder:text-white/20"
              />
            </div>

            {error && <p className="text-red-400 text-xs font-legan">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-300 font-legan text-sm transition-colors disabled:opacity-50"
            >
              {loading ? "Submitting…" : giftType === "item" ? "Book This Gift 🎁" : "Confirm Cash Gift 💵"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function BankRow({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  return (
    <div className="flex justify-between items-center text-xs gap-2">
      <span className="text-white/40 font-legan flex-shrink-0">{label}</span>
      <span className="text-white font-mono truncate flex items-center gap-2">
        {value}
        {copyable && (
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(value)}
            className="text-amber-400 text-[0.6rem] hover:text-amber-300 flex-shrink-0 transition-colors"
          >
            Copy
          </button>
        )}
      </span>
    </div>
  );
}
