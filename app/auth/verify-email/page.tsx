"use client";

import Link from "next/link";
import { StarField } from "@/components/home/star-field";
import { ScrollReveal } from "@/components/home/scroll-reveal";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      <section className="relative px-4 py-20 md:px-6 md:py-32">
        <div className="absolute inset-0 pointer-events-none">
          <StarField />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[500px]">
          <ScrollReveal>
            <div className="rounded-[24px] border border-white/[0.1] bg-[#080808] p-8 backdrop-blur-xl text-center">
              <div className="flex justify-center mb-6">
                <span className="text-5xl">✉️</span>
              </div>

              <h1 className="text-2xl font-black tracking-[-0.03em] text-white md:text-3xl">
                Check Your Email
              </h1>

              <p className="mt-4 text-sm leading-6 text-white/40">
                We've sent you a confirmation link. Click the link in your email to verify your account and get started with ZETRAXUS.
              </p>

              <div className="mt-8 rounded-lg border border-white/[0.1] bg-white/[0.02] p-4">
                <p className="text-[12px] text-white/30">
                  Didn't receive an email? Check your spam folder or try signing up again.
                </p>
              </div>

              <Link
                href="/auth/login"
                className="mt-8 inline-flex h-11 items-center rounded-full border border-white/25 px-7 text-[10px] font-semibold tracking-[3px] text-white/40 transition-colors hover:border-white/50 hover:text-white uppercase"
              >
                ← Back to Login
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
