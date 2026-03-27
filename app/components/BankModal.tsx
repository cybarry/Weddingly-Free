"use client";

import { config } from "@/lib/config";
import { formatPrice } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface GiftItem {
  _id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  imageUrl: string;
  giftedStatus: "none" | "item" | "cash";
}

interface BankModalProps {
  item: GiftItem | null;
  onClose: () => void;
}

export default function BankModal({ item, onClose }: BankModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!item) return null;

  const { account1, account2 } = config.bank;
  const hasAccount2 = account2.bankName && account2.accountNumber;


  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900/60 to-yellow-900/40 px-6 py-5 border-b border-white/10">
          <h2 className="text-white font-semibold text-lg">Gift Transfer Details</h2>
          <p className="text-amber-200/80 text-sm mt-1">
            Please transfer{" "}
            <span className="font-bold text-amber-300">
              {formatPrice(item.price, item.currency)}
            </span>{" "}
            for <span className="italic">{item.name}</span>
          </p>
        </div>

        {/* Bank Accounts */}
        <div className="px-6 py-5 space-y-4">
          {account1.bankName && (
            <BankAccount
              label="Option 1"
              bankName={account1.bankName}
              accountName={account1.accountName}
              accountNumber={account1.accountNumber}
            />
          )}

          {hasAccount2 && (
            <BankAccount
              label="Option 2"
              bankName={account2.bankName}
              accountName={account2.accountName}
              accountNumber={account2.accountNumber}
            />
          )}

          {!account1.bankName && !hasAccount2 && (
            <p className="text-white/50 text-sm text-center py-4">
              Bank details not configured yet. Please contact the couple directly.
            </p>
          )}
        </div>

        {/* Note */}
        <div className="px-6 pb-2">
          <p className="text-white/40 text-xs text-center">
            Please include the gift name as a transfer note. Thank you for your generosity! 🎊
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function BankAccount({
  label,
  bankName,
  accountName,
  accountNumber,
}: {
  label: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
}) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <p className="text-white/40 text-xs uppercase tracking-widest mb-3">{label}</p>
      <div className="space-y-2">
        <Row label="Bank" value={bankName} />
        <Row label="Account Name" value={accountName} />
        <Row label="Account Number" value={accountNumber} copyable />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  copyable,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const copy = () => navigator.clipboard.writeText(value);
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-white/50">{label}</span>
      <span className="text-white font-mono font-medium flex items-center gap-2">
        {value}
        {copyable && (
          <button
            onClick={copy}
            title="Copy"
            className="text-amber-400 hover:text-amber-300 text-xs transition-colors"
          >
            Copy
          </button>
        )}
      </span>
    </div>
  );
}
