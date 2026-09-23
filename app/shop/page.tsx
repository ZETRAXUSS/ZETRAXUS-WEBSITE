"use client";

import { useState } from "react";
import { StarField } from "@/components/home/star-field";
import { ParallaxField } from "@/components/home/parallax-field";
import { ScrollReveal } from "@/components/home/scroll-reveal";

const categories = [
  { name: "Books", icon: "📚", count: "Coming soon" },
  { name: "Digital", icon: "💿", count: "Coming soon" },
  { name: "3D Prints", icon: "🖨️", count: "Coming soon" },
  { name: "Services", icon: "✨", count: "Coming soon" },
];

const featured = [
  { number: "01", title: "Premium Template Kit", price: "$29", creator: "Design Studio", category: "Digital" },
  { number: "02", title: "World Building Guide", price: "$19", creator: "Lore Master", category: "Books" },
  { number: "03", title: "Character Design Service", price: "$199", creator: "Art Pro", category: "Services" },
  { number: "04", title: "Miniature Set", price: "$49", creator: "3D Creator", category: "3D Prints" },
  { number: "05", title: "Story Writing Toolkit", price: "$15", creator: "Writer Elite", category: "Digital" },
  { number: "06", title: "Asset Pack Vol.1", price: "$39", creator: "Assets Studio", category: "Digital" },
];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const visibleProducts =
    activeCategory === "All"
      ? featured
      : featured.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      {/* =========================================================
          HERO
      ========================================================== */}

      <section className="px-4 pb-6 pt-6 md:px-6 md:pb-8 md:pt-8">
        <div
          className="
            hero-frame group relative mx-auto flex
            min-h-[420px] w-full max-w-[1760px]
            flex-col items-center justify-center
            overflow-hidden rounded-[32px]
            border border-white/[0.12]
            bg-[#030303]
            transition-[border-color,box-shadow]
            duration-1000
            hover:border-white/[0.2]
            hover:shadow-[0_25px_100px_rgba(0,0,0,0.55)]
          "
        >
          <ParallaxField />
          <StarField />

          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.03] blur-[130px] transition-all duration-[1800ms] ease-out group-hover:scale-[1.25] group-hover:bg-white/[0.05]" />

          <div className="pointer-events-none absolute left-[7%] right-[7%] top-1/2 h-px bg-white/[0.035] transition-all duration-[1200ms] group-hover:left-[4%] group-hover:right-[4%] group-hover:bg-white/[0.07]" />

          <div className="pointer-events-none absolute left-7 top-7 h-7 w-7 border-l border-t border-white/[0.08] transition-all duration-700 ease-out group-hover:h-11 group-hover:w-11 group-hover:border-white/[0.2]" />
          <div className="pointer-events-none absolute right-7 top-7 h-7 w-7 border-r border-t border-white/[0.08] transition-all duration-700 ease-out group-hover:h-11 group-hover:w-11 group-hover:border-white/[0.2]" />
          <div className="pointer-events-none absolute bottom-7 left-7 h-7 w-7 border-b border-l border-white/[0.08] transition-all duration-700 ease-out group-hover:h-11 group-hover:w-11 group-hover:border-white/[0.2]" />
          <div className="pointer-events-none absolute bottom-7 right-7 h-7 w-7 border-b border-r border-white/[0.08] transition-all duration-700 ease-out group-hover:h-11 group-hover:w-11 group-hover:border-white/[0.2]" />

          <div
            className="
              relative z-10 flex flex-col items-center px-6 text-center
              transition-transform duration-[1200ms]
              ease-[cubic-bezier(0.16,1,0.3,1)]
              group-hover:-translate-y-1
            "
          >
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-white/15 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-16 group-hover:bg-white/35" />
              <p className="text-[10px] font-medium tracking-[6px] text-white/35 transition-all duration-1000 group-hover:tracking-[8px] group-hover:text-white/55 md:text-[12px]">
                MARKETPLACE
              </p>
              <span className="h-px w-8 bg-white/15 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-16 group-hover:bg-white/35" />
            </div>

            <h1 className="shop-title relative z-10 mt-5 text-[48px] font-black leading-none text-white sm:text-[60px] md:text-[76px] lg:text-[86px]">
              SHOP
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/35 md:text-base">
              Premium digital products, physical goods and creative
              services from talented creators. Support artists and own
              something worth keeping.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          CATEGORY SHOWCASE
      ========================================================== */}

      <section className="mx-auto w-full max-w-[1760px] px-6 py-20 md:px-10 md:py-28">
        <ScrollReveal>
          <div className="mb-10 flex items-end justify-between border-b border-white/[0.08] pb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[5px] text-white/25">
                BROWSE
              </p>
              <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] md:text-3xl">
                Categories
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.name;

              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setActiveCategory(isActive ? "All" : cat.name)}
                  className={`
                    group/cat relative flex flex-col items-center justify-center gap-3
                    overflow-hidden rounded-[20px] border px-4 py-8
                    text-center transition-all duration-500
                    ${
                      isActive
                        ? "border-white bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        : "border-white/[0.1] bg-[#080808] hover:-translate-y-1 hover:border-white/[0.23] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                    }
                  `}
                >
                  <span className="text-3xl transition-transform duration-500 group-hover/cat:scale-110">
                    {cat.icon}
                  </span>
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-[2px] ${
                      isActive ? "text-black" : "text-white/75"
                    }`}
                  >
                    {cat.name}
                  </span>
                  <span
                    className={`text-[10px] ${
                      isActive ? "text-black/50" : "text-white/25"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollReveal>
      </section>

      {/* =========================================================
          FEATURED PRODUCTS
      ========================================================== */}

      <section className="mx-auto w-full max-w-[1760px] px-6 pb-32 md:px-10 md:pb-40">
        <div className="mb-12 flex items-end justify-between border-b border-white/[0.08] pb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[5px] text-white/25">
              FEATURED
            </p>
            <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] md:text-3xl">
              Curated Products
            </h3>
          </div>

          <span className="hidden text-[10px] tracking-[3px] text-white/20 md:block">
            {String(visibleProducts.length).padStart(2, "0")} ITEMS
          </span>
        </div>

        <div className="grid gap-x-6 gap-y-16 md:grid-cols-3 md:gap-x-8">
          {visibleProducts.map((product, index) => (
            <ScrollReveal key={product.number} delay={index * 90}>
              <article className="group/media">
                <div
                  className="
                    relative aspect-square
                    overflow-hidden rounded-[24px]
                    border border-white/[0.1]
                    bg-[#080808]
                    transition-all duration-700
                    group-hover/media:-translate-y-1
                    group-hover/media:border-white/[0.23]
                    group-hover/media:shadow-[0_20px_70px_rgba(0,0,0,0.45)]
                  "
                >
                  <div className="absolute inset-3 rounded-[18px] border border-white/[0.035] transition-all duration-700 group-hover/media:border-white/[0.08]" />

                  <div className="absolute left-1/2 top-1/2 h-32 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.025] blur-[55px] transition-all duration-700 group-hover/media:scale-150 group-hover/media:bg-white/[0.05]" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] uppercase tracking-[4px] text-white/15 transition-all duration-500 group-hover/media:tracking-[6px] group-hover/media:text-white/35">
                      {product.category}
                    </span>
                  </div>

                  <span className="absolute left-5 top-5 text-[10px] tracking-[3px] text-white/25">
                    {product.number}
                  </span>

                  <span className="absolute right-5 top-5 rounded-full border border-white/[0.15] bg-white/[0.04] px-3 py-1 text-[11px] font-semibold tracking-[1px] text-white/80">
                    {product.price}
                  </span>

                  <span className="absolute bottom-5 right-5 h-4 w-4 border-b border-r border-white/10 transition-all duration-500 group-hover/media:h-6 group-hover/media:w-6 group-hover/media:border-white/30" />

                  <div className="media-shine pointer-events-none absolute -left-[60%] top-0 h-full w-[45%] skew-x-[-20deg] bg-white/[0.045]" />
                </div>

                <div className="mt-5">
                  <h4 className="text-[12px] font-semibold tracking-[3px] text-white/75 transition-all duration-500 group-hover/media:tracking-[3.5px] group-hover/media:text-white">
                    {product.title.toUpperCase()}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-white/30 transition-colors duration-500 group-hover/media:text-white/50">
                    by {product.creator}
                  </p>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* =========================================================
          SELL YOUR CREATIONS — DIGITAL ONLY
      ========================================================== */}

      <section className="px-6 pb-10 md:px-10">
        <ScrollReveal>
          <div className="group/cta relative mx-auto flex min-h-[430px] w-full max-w-[1760px] flex-col items-center justify-center overflow-hidden rounded-[30px] border border-white/[0.1] bg-[#050505] text-center transition-all duration-700 hover:border-white/[0.18]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055),transparent_60%)] transition-transform duration-[1500ms] group-hover/cta:scale-125" />

            <div className="relative z-10 px-6">
              <p className="text-[10px] font-medium uppercase tracking-[5px] text-white/30">
                CREATOR MARKETPLACE
              </p>

              <h3 className="mt-5 text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
                Sell your digital creations.
              </h3>

              <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-white/30">
                Templates, asset packs, ebooks, presets and plugins — list
                your digital products and build a sustainable creative
                business on ZETRAXUS.
              </p>

              <button
                type="button"
                disabled
                className="
                  mt-8 inline-flex h-11
                  cursor-not-allowed items-center rounded-full
                  border border-white/25
                  px-7
                  text-[10px] font-semibold
                  tracking-[3px] text-white/40
                  opacity-60
                "
              >
                LIST A DIGITAL PRODUCT — COMING SOON
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <style>{`
        .shop-title {
          transition:
            letter-spacing 1100ms cubic-bezier(0.16, 1, 0.3, 1),
            transform 1100ms cubic-bezier(0.16, 1, 0.3, 1),
            text-shadow 1100ms ease;
        }

        .hero-frame:hover .shop-title {
          letter-spacing: 4px;
          transform: scale(1.015);
          text-shadow:
            0 0 22px rgba(255,255,255,0.85),
            0 0 65px rgba(255,255,255,0.3);
        }

        @keyframes media-shine {
          0% { left: -60%; }
          45%, 100% { left: 130%; }
        }

        .group\\/media:hover .media-shine {
          animation: media-shine 1.4s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .shop-title {
            transition: none;
          }
          .hero-frame:hover .shop-title {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
