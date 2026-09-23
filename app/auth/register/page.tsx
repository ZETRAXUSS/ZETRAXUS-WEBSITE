"use client";

import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { StarField } from "@/components/home/star-field";
import { ScrollReveal } from "@/components/home/scroll-reveal";

export default function RegisterPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      <section className="relative px-4 py-20 md:px-6 md:py-32">
        <div className="absolute inset-0 pointer-events-none">
          <StarField />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[400px]">
          <ScrollReveal>
            <div className="mb-12 text-center">
              <h1 className="text-3xl font-black tracking-[-0.03em] text-white md:text-4xl">
                Create Account
              </h1>
              <p className="mt-3 text-sm text-white/40">
                Join the ZETRAXUS community
              </p>
            </div>

            <div className="rounded-[24px] border border-white/[0.1] bg-[#080808] p-8 backdrop-blur-xl">
              <RegisterForm />

              <div className="mt-8 border-t border-white/[0.08] pt-6">
                <p className="text-center text-[12px] text-white/40">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="text-white transition-colors hover:text-white/80"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/"
                className="text-[11px] font-medium uppercase tracking-[2px] text-white/40 transition-colors hover:text-white/60"
              >
                ← Back to Home
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
