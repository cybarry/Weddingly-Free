"use client";
import { formatPrice } from "@/lib/utils";
interface GiftItem {
  _id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  imageUrl: string;
  giftedStatus: "none" | "item" | "cash";
}

interface GiftCardProps {
  item: GiftItem;
  onGift: (item: GiftItem) => void;
}

export default function GiftCard({ item, onGift }: GiftCardProps) {
  const isGifted = item.giftedStatus !== "none";



  return (
    <div className={`group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${isGifted ? "opacity-55" : "hover:border-amber-500/40 hover:bg-white/8"}`}>

      {/* Gifted stamp overlay */}
      {isGifted && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="rotate-[-18deg] border-4 border-green-400/60 rounded-lg px-5 py-2 text-green-400/80 font-bold text-xl tracking-widest uppercase select-none">
            {item.giftedStatus === "cash" ? "Cash Gifted ✅" : "Gifted ✅"}
          </div>
        </div>
      )}

      {/* Image */}
      <div className="relative h-48 bg-white/5 overflow-hidden">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            🎁
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className={`font-semibold text-base leading-snug ${isGifted ? "line-through text-white/40" : "text-white"}`}>
            {item.name}
          </h3>
          <span className="text-amber-300 font-bold text-sm whitespace-nowrap">
            {formatPrice(item.price, item.currency)}
          </span>
        </div>

        {item.description && (
          <p className="text-white/50 text-sm leading-relaxed flex-1 mb-4">
            {item.description}
          </p>
        )}

        {/* CTA */}
        <div className="mt-auto">
          {isGifted ? (
            <div className="w-full py-2.5 rounded-xl bg-green-500/10 border border-green-400/20 text-green-400/60 text-sm font-medium text-center cursor-not-allowed select-none">
              Already Gifted ✅
            </div>
          ) : (
            <button
              onClick={() => onGift(item)}
              className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-300 text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
            >
              🎁 Gift This Item
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
