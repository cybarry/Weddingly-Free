"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { IoIosArrowUp } from "react-icons/io";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import CountdownTimer from "./Countdown";
import Form from "./Form";
import GiftBookingModal from "./GiftBookingModal";
import { config } from "@/lib/config";
import { formatPrice } from "@/lib/utils";

interface RegistryItem {
  _id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  imageUrl: string;
  giftedStatus: "none" | "item" | "cash";
}

type WeddingScreenProps = {
  name?: string;
};

const WeddingScreen = ({ name }: WeddingScreenProps) => {
  const [fadeClass, setFadeClass] = useState("opacity-0");
  const [isOpen, setIsOpen] = useState(false);
  const [registryItems, setRegistryItems] = useState<RegistryItem[]>([]);
  const [bookingItem, setBookingItem] = useState<RegistryItem | null>(null);
  const [loadingRegistry, setLoadingRegistry] = useState(false);
  const audioRef = useRef(null);

  // Untuk fade-in pertama kali
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeClass("opacity-100");
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && audioRef.current) {
      // Play music when "Open" is clicked
      (audioRef.current as HTMLAudioElement).play();
    }
  };

  const { ref: mainRef, inView: isMainInView } = useInView({
    threshold: 0.5,
  });

  const { ref: main2Ref, inView: isMain2InView } = useInView({
    threshold: 0.5,
  });

  const { ref: slide1Ref, inView: isSlide1InView } = useInView({
    threshold: 0.5,
  });
  const { ref: slide5Ref, inView: isSlide5InView } = useInView({
    threshold: 0.5,
  });
  const { ref: slide9Ref, inView: isSlide9InView } = useInView({
    threshold: 0.5,
  });
  const { ref: endRef, inView: isEndInView } = useInView({
    threshold: 0.5,
  });
  const { ref: registryRef, inView: isRegistryInView } = useInView({
    threshold: 0.3,
  });

  const fetchRegistryItems = useCallback(async () => {
    setLoadingRegistry(true);
    try {
      const res = await fetch("/api/registry/items");
      const data = await res.json();
      setRegistryItems(data);
    } catch (e) {
      console.error("Failed to load registry", e);
    } finally {
      setLoadingRegistry(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistryItems();
  }, [fetchRegistryItems]);

  return (
    <div
      className={`h-screen w-screen flex flex-col md:flex-row ${fadeClass} transition-opacity duration-1000`}
    >
      {/* Gambar sisi kiri Wide Untuk Komputer */}
      <div
        className="md:flex justify-center hidden items-end pb-12 w-2/3 h-1/2 md:h-full"
        style={{
          backgroundImage: `url(/main.jpeg)`, //refer to base 1st photo
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className={`bottom-10 left-20 font-ovo text-lg text-white tracking-[5px] uppercase`}
        >
          {config.coupleNames}
        </div>
      </div>

      {/* Konten teks sisi kanan bisa scroll untuk pc */}
      <div className=" md:w-1/3 h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth">
        <div
          id="backgroundWedding"
          className=" snap-start  w-full h-screen flex items-center justify-center "
        >
          <div className="text-center p-5 flex flex-col h-full justify-between py-20">
            <div className="gap-y-2 md:gap-y-4 flex flex-col">
              <h5
                className={`text-sm font-legan text-white uppercase tracking-wide fadeMain2 ${isMain2InView ? "active" : ""
                  } `}
                ref={main2Ref}
              >
                The Wedding Of
              </h5>
              <h1
                className={`text-2xl md:text-3xl font-ovo t text-white uppercase fadeMain ${isMainInView ? "active" : ""
                  } `}
                ref={mainRef}
              >
                {config.coupleNames}
              </h1>
              <h5
                className={`text-sm  font-legan text-white uppercase tracking-wide  fadeMain2 ${isMain2InView ? "active" : ""
                  } `}
                ref={main2Ref}
              >
                {new Date(config.eventDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h5>
            </div>
            <div>
              <p className="mt-5 text-lg uppercase font-xs tracking-widest text-white">
                {name ? `Dear ${name},` : "Welcome"}
              </p>
              {!isOpen ? (
                <button
                  className="animate-bounce  mt-5 px-5 py-1 uppercase text-xs border border-white hover:text-white hover:bg-transparent rounded-full bg-white text-black transition"
                  onClick={handleOpen}
                >
                  Open Invitation
                </button>
              ) : (
                <IoIosArrowUp
                  stroke="4"
                  className="mx-auto mt-20 animate-upDown text-white"
                />
              )}
            </div>
          </div>
        </div>
        {isOpen && (
          <>
            {/* Slide 1 */}
            <div
              className={`text-white h-screen flex pt-12 p-5 px-12 snap-start `}
              style={{
                backgroundImage: `url(/slide1.jpeg)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                ref={slide1Ref}
                className={` ${isSlide1InView ? "active" : ""}  fadeInMove`}
              >
                <h1 className="text-xl md:text-2xl font-ovo tracking-wide text-white uppercase">
                  {config.bibleVerse}
                </h1>
                <p className="text-sm mt-5 font-legan">
                  {config.bibleVerseContent}
                </p>
                <p className="text-6xl mt-5 font-wonder">{config.coupleNames}</p>
              </div>
            </div>
            {/* Slide 5 */}
            <div
              className="snap-start  text-white h-screen flex flex-col items-center px-12 "
              style={{
                backgroundImage: `url(/slide5.jpeg)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                ref={slide5Ref}
                className={` ${isSlide5InView ? "active" : ""
                  }  fadeInMove flex items-center flex-col pt-32 `}
              >
                <h3 className="uppercase font-legan text-xs tracking-wide mt-5 mb-2">
                  save our date
                </h3>
                <h1 className="text-2xl w-[200px] text-center text-white  font-ovo uppercase">
                  {new Date(config.eventDate).toLocaleDateString("en-US", {
                    weekday: "long",
                  })} <br />  {new Date(config.eventDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h1>
                {config.holyMatrimony.enabled && (
                  <div className="mt-5 mx-auto flex flex-col items-center">
                    <h3 className="uppercase font-ovo text-sm text-center mt-5 mb-2">
                      Nikkah <br /> {config.holyMatrimony.time}
                    </h3>
                    <p className="text-sm text-center  font-legan text-white">
                      {config.holyMatrimony.place} <br /> {config.holyMatrimony.place_details}
                    </p>
                    <Link
                      href={config.holyMatrimony.googleMapsLink}
                      target="_blank"
                      className="cursor-pointer hover:text-white/20 text-sm rounded-full flex items-center gap-x-2 text-center font-legan mt-5 bg-[#808080] w-fit px-4 py-2 text-white"
                    >
                      Google Maps
                    </Link>
                  </div>
                )}

                {config.weddingReception.enabled && (
                  <div className="mt-5 mx-auto flex  flex-col items-center">
                    <h3 className="uppercase font-ovo text-sm text-center mt-5 mb-2">
                      Walima <br /> {config.weddingReception.time}
                    </h3>
                    <p className="text-sm text-center  font-legan text-white">
                      {config.weddingReception.place} <br /> {config.weddingReception.place_details}
                    </p>
                    <Link
                      href={config.weddingReception.googleMapsLink}
                      target="_blank"
                      className="cursor-pointer hover:text-white/20 text-sm rounded-full flex items-center gap-x-2 text-center font-legan mt-5 bg-[#808080] w-fit px-4 py-2 text-white"
                    >
                      Google Maps
                    </Link>
                  </div>
                )}

                {/* Countdown */}
                <div className="mt-6 flex flex-col items-center">
                  <h3 className="uppercase font-legan text-xs tracking-widest text-white/70 mb-2">Almost time for our celebration</h3>
                  <CountdownTimer />
                </div>
              </div>
            </div>

            {/* Registry Slide */}
            <div
              className="snap-start text-white min-h-screen flex flex-col py-14 px-8 relative"
              style={{
                backgroundImage: `url(/slide9.jpeg)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-black/65 pointer-events-none" />
              <div
                ref={registryRef}
                className={`${isRegistryInView ? "active" : ""} fadeInMove relative z-10`}
              >
                <p className="text-[0.6rem] font-legan tracking-[0.3em] uppercase text-amber-300/70 text-center mb-1">
                  With Allah&apos;s Blessings
                </p>
                <h1 className="text-2xl font-ovo text-white uppercase text-center tracking-wide">
                  Gift Registry
                </h1>
                <div className="flex items-center gap-2 justify-center mt-2 mb-3">
                  <hr className="w-10 border-white/20" />
                  <span className="text-amber-400/60 text-sm">✦</span>
                  <hr className="w-10 border-white/20" />
                </div>
                <p className="text-[0.65rem] font-legan text-white/45 text-center mb-6 leading-relaxed px-2">
                  Your presence is our greatest gift. Should you wish to honour us further, here are a few things we&apos;d love:
                </p>
                {loadingRegistry ? (
                  <p className="text-center text-white/30 text-xs py-8 font-legan">Loading registry…</p>
                ) : registryItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-3xl mb-2">🎁</p>
                    <p className="text-white/30 text-xs font-legan">Registry coming soon</p>
                  </div>
                ) : (
                  <div className="max-h-[52vh] overflow-y-auto space-y-2.5 pr-1">
                    {registryItems.map((item) => {
                      const price = formatPrice(item.price, item.currency || "USD");
                      return (
                        <div
                          key={item._id}
                          className={`border rounded-xl p-3 flex items-center gap-3 transition-colors duration-200 ${item.giftedStatus !== "none"
                            ? "bg-white/3 border-white/5 opacity-40"
                            : "bg-white/5 border-white/10 hover:border-amber-400/25"
                            }`}
                        >
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 ring-1 ring-white/10" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-xl">🎁</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <p className={`font-ovo text-sm truncate leading-tight ${item.giftedStatus !== "none" ? "line-through text-white/40" : "text-white"}`}>
                                {item.name}
                              </p>
                            </div>
                            <p className="text-amber-300 text-xs font-mono">{price}</p>
                            {item.description && (
                              <p className="text-white/35 text-[0.6rem] font-legan truncate leading-tight mt-0.5">{item.description}</p>
                            )}
                          </div>
                          {item.giftedStatus !== "none" ? (
                            <div className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-400/20 text-green-400/70 text-[0.6rem] font-legan uppercase tracking-wider cursor-not-allowed">
                              {item.giftedStatus === "cash" ? "Cash Gifted ✅" : "Gifted ✅"}
                            </div>
                          ) : (
                            <button
                              onClick={() => setBookingItem(item)}
                              className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 border border-amber-400/25 hover:border-amber-400/50 text-amber-300 text-[0.6rem] font-legan uppercase tracking-wider transition-all duration-200"
                            >
                              Gift&nbsp;🎁
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── Bank Account Footer ── */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-[0.55rem] font-legan tracking-[0.25em] uppercase text-white/35 text-center mb-2">Direct Bank Transfer</p>
                  {config.bank.account1.bankName && (
                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-white/40 text-[0.6rem] font-legan">Bank</span>
                        <span className="text-white text-[0.65rem] font-mono">{config.bank.account1.bankName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/40 text-[0.6rem] font-legan">Account Name</span>
                        <span className="text-white text-[0.65rem] font-mono">{config.bank.account1.accountName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/40 text-[0.6rem] font-legan">Account No.</span>
                        <span className="text-amber-300 text-xs font-mono font-bold">{config.bank.account1.accountNumber}</span>
                      </div>
                    </div>
                  )}
                  {/* View full registry link */}
                  <Link
                    href="/registry"
                    className="mt-3 flex items-center justify-center gap-1.5 text-[0.65rem] font-legan text-amber-400/60 hover:text-amber-400 transition-colors"
                  >
                    View Full Registry &rarr;
                  </Link>
                </div>
              </div>
            </div>
            {/* SLIDE 9 */}
            {config.rsvp.enabled && (
              <div
                className="snap-start text-white h-screen flex flex-col justify-center pt-16 pb-16 px-8"
                style={{
                  backgroundImage: `url(/slide92.jpeg)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div
                  ref={slide9Ref}
                  className={`${isSlide9InView ? "active" : ""} fadeInMove`}
                >
                  <h1 className="text-3xl text-white font-ovo text-center uppercase">
                    RSVP AND WISHES
                  </h1>
                  <p className="text-sm font-legan text-white/80 text-center">
                    {config.rsvp.detail}
                  </p>

                  <Form />
                </div>
              </div>
            )}

            {/* SLIDE AKHIR */}
            <div
              className="snap-start text-white h-screen flex flex-col justify-end pt-16 pb-16 px-12 "
              style={{
                backgroundImage: `url(/slide10.jpeg)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                ref={endRef}
                className={` ${isEndInView ? "active" : ""} fadeInMove `}
              >
                <h1 className="text-3xl text-white  font-ovo text-center uppercase">
                  {config.thankyou}
                </h1>

                <div className="mt-5 mx-auto flex flex-col ">
                  <p className="text-sm font-legan text-white text-center">
                    {config.thankyouDetail}
                  </p>
                  <p className="text-sm rounded-full text-center font-ovo mt-5 px-6 py-2 text-white uppercase">
                    {config.coupleNames}
                  </p>
                </div>
              </div>

              <footer className="flex flex-col items-center mt-8">
                <p className="text-[0.5rem] uppercase text-center">
                  Created By cybarry
                </p>
                <p className="text-xs">© All rights reserved by petershaan</p>
              </footer>
            </div>
          </>
        )}
      </div>
      {/* Audio Element */}
      <audio ref={audioRef} src="/music/wedding_song.mp3" preload="auto" />
      {/* Gift Booking Modal */}
      {bookingItem && (
        <GiftBookingModal item={bookingItem} onClose={() => setBookingItem(null)} />
      )}
    </div>
  );
};

export default WeddingScreen;
