"use client";

import { useState, useEffect, useCallback } from "react";
import GiftCard from "@/app/components/GiftCard";
import GiftBookingModal from "@/app/components/GiftBookingModal";
import { config } from "@/lib/config";
import Link from "next/link";

interface GiftItem {
  _id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  imageUrl: string;
  giftedStatus: "none" | "item" | "cash";
}

export default function RegistryPage() {
  const [items, setItems] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingItem, setBookingItem] = useState<GiftItem | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/registry/items");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch registry items", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const { account1, account2 } = config.bank;

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-white pb-56">

      {/* ── Hero ── */}
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10">
          <p className="text-amber-400/70 text-sm uppercase tracking-[0.25em] mb-3 font-light">
            With Allah&apos;s Blessings
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
            Gift Registry
          </h1>
          <p className="text-white/40 text-base font-light mb-1">{config.coupleNames}</p>
          <p className="text-white/40 text-sm max-w-xl mx-auto mt-3">
            Your presence is the greatest gift. Should you wish to honour us further, here are a few things we&apos;d love.
          </p>
          <Link
            href="/"
            className="inline-block mt-5 text-xs text-amber-400/50 hover:text-amber-400 transition-colors"
          >
            ← Back to Invitation
          </Link>
        </div>
      </section>

      {/* ── Gift Grid ── */}
      <section className="max-w-6xl mx-auto px-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 text-white/30">
            <p className="text-5xl mb-4">🎁</p>
            <p className="text-lg">No registry items yet — check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <GiftCard
                key={item._id}
                item={item}
                onGift={setBookingItem}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Fixed Bank Account Panel ── */}
      {account1.bankName && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#111]/95 backdrop-blur-md border-t border-white/10">
          <div className="max-w-4xl mx-auto px-5 py-4">
            {/* Label */}
            <p className="text-[0.55rem] font-light tracking-[0.3em] uppercase text-amber-300/60 text-center mb-3">
              Prefer to gift cash? Transfer directly to:
            </p>

            {/* Accounts row */}
            <div className={`grid gap-4 ${account2.bankName ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 max-w-sm mx-auto"}`}>
              {/* Account 1 */}
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex flex-col gap-1.5">
                <p className="text-[0.55rem] uppercase tracking-widest text-white/30 mb-1">{account1.bankName}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40">Account Name</span>
                  <span className="text-white font-medium">{account1.accountName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40">Account No.</span>
                  <span className="flex items-center gap-2 text-amber-300 font-mono font-bold">
                    {account1.accountNumber}
                    <button
                      onClick={() => navigator.clipboard.writeText(account1.accountNumber)}
                      className="text-[0.55rem] text-amber-400/60 hover:text-amber-300 border border-amber-400/20 px-1.5 py-0.5 rounded transition-colors"
                    >
                      Copy
                    </button>
                  </span>
                </div>
              </div>

              {/* Account 2 (optional) */}
              {account2.bankName && (
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex flex-col gap-1.5">
                  <p className="text-[0.55rem] uppercase tracking-widest text-white/30 mb-1">{account2.bankName}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/40">Account Name</span>
                    <span className="text-white font-medium">{account2.accountName}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/40">Account No.</span>
                    <span className="flex items-center gap-2 text-amber-300 font-mono font-bold">
                      {account2.accountNumber}
                      <button
                        onClick={() => navigator.clipboard.writeText(account2.accountNumber)}
                        className="text-[0.55rem] text-amber-400/60 hover:text-amber-300 border border-amber-400/20 px-1.5 py-0.5 rounded transition-colors"
                      >
                        Copy
                      </button>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gift Booking Modal */}
      {bookingItem && (
        <GiftBookingModal item={bookingItem} onClose={() => setBookingItem(null)} />
      )}
    </main>
  );
}
