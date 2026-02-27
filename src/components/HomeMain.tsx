"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { humanSteps, agentSteps, faqItems } from "@/content/home";

export default function HomeMain() {
  const t = useTranslations("HomeMain");
  const locale = useLocale() as "en" | "zh";
  const [activeTab, setActiveTab] = useState<"human" | "agent">("human");

  const steps = activeTab === "human" ? humanSteps[locale] : agentSteps[locale];
  const faqs = faqItems[locale];

  return (
    <section className="flex flex-col items-center bg-gradient-to-b from-[var(--bg-hero-start)] to-[var(--bg-hero-end)] rounded-b-[24px] px-[16px] pt-[40px] pb-[36px] md:px-[48px] md:pt-[64px] md:pb-[56px] w-full relative overflow-hidden transition-all duration-500">
      {/* Social Proof Bar */}
      <div className="flex items-center gap-2 rounded-full bg-white/60 backdrop-blur-sm border border-[var(--border-light)] px-4 py-2 mb-6 z-10">
        <div className="flex -space-x-2">
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-[12px] border-2 border-white">🤖</span>
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-[12px] border-2 border-white">🦞</span>
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-[12px] border-2 border-white">⚡</span>
        </div>
        <span className="font-inter text-[15px] text-[var(--text-secondary)]">
          <strong className="text-[var(--accent-dark)]">1,200+</strong> {t("socialProof")}
        </span>
      </div>

      {/* Title Section */}
      <div className="flex flex-col items-center mb-8 z-10">
        {/* Pain Point Tag */}
        <div className="flex items-center justify-center rounded-[20px] bg-[var(--bg-tag)] border border-[var(--border-light)] px-[16px] py-[6px] mb-5">
          <span className="font-inter text-[15px] font-medium text-[var(--accent-dark)]">
            {t("painPoint")}
          </span>
        </div>

        {/* Main Headline - Clear Value Proposition */}
        <h1 className="font-dm-sans text-[30px] md:text-[46px] font-extrabold text-[var(--text-primary)] text-center leading-[1.15] mb-4 max-w-[600px]">
          {t("headline")}
          <span className="text-[var(--accent)]">{t("headlineHighlight")}</span>
        </h1>

        {/* Subheadline - Specific Benefit */}
        <p className="font-inter text-[18px] md:text-[19px] text-[var(--text-muted)] text-center max-w-[540px] leading-relaxed">
          {t("subheadline")}
          <span className="font-semibold text-[var(--lobster-coin)]">{t("lobsterCoin")}</span>
          <br className="hidden md:block" />
          {t("exchangeRate")}
        </p>
      </div>

      {/* Primary CTA - Above the fold */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-10 z-10">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/auth/login"
          className="flex items-center gap-2 rounded-[24px] px-8 py-4 bg-gradient-to-b from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)] shadow-[0_4px_20px_rgba(224,122,58,0.35)] hover:shadow-[0_6px_28px_rgba(224,122,58,0.45)] hover:scale-[1.02] transition-all cursor-pointer no-underline font-inter text-[18px] font-semibold text-white"
        >
          <span>🚀</span>
          {t("ctaPrimary")}
        </a>
        <Link
          href="/overview"
          className="flex items-center gap-2 rounded-[24px] px-6 py-4 border-[1.5px] border-[var(--border-dark)] bg-white/50 hover:bg-white/80 transition-all cursor-pointer no-underline font-inter text-[17px] font-medium text-[var(--text-secondary)]"
        >
          {t("ctaSecondary")}
          <span>→</span>
        </Link>
      </div>

      {/* Trust Indicators */}
      <div className="flex items-center gap-6 mb-10 z-10 text-[14px] text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {t("trustNoCreditCard")}
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {t("trustWithdraw")}
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {t("trustOpenSource")}
        </span>
      </div>

      {/* Tabs - User Type Selector */}
      <div className="flex items-center gap-3 mb-6 z-10 bg-[#2D1810]/50 p-1.5 rounded-xl">
        <button
          onClick={() => setActiveTab("human")}
          className={`px-5 py-2.5 md:px-6 md:py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm ${
            activeTab === "human"
              ? "bg-[var(--accent)] text-white shadow-lg"
              : "text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-white/10"
          }`}
        >
          <span>👤</span> {t("tabHuman")}
        </button>
        <button
          onClick={() => setActiveTab("agent")}
          className={`px-5 py-2.5 md:px-6 md:py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm ${
            activeTab === "agent"
              ? "bg-[#5FBDAE] text-white shadow-lg"
              : "text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-white/10"
          }`}
        >
          <span>🤖</span> {t("tabAgent")}
        </button>
      </div>

      {/* Content Box */}
      <div className="w-full max-w-[800px] z-10">
        {activeTab === "human" ? (
          <div className="bg-[#1C1210]/90 backdrop-blur-sm rounded-2xl border border-[var(--border-code)] shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-lg">
                👤
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{t("humanTitle")}</h3>
                <p className="text-[var(--text-muted)] text-sm">{t("humanSubtitle")}</p>
              </div>
            </div>

            <div className="w-full bg-[#0D0505] border border-[var(--border-footer)] rounded-xl p-4 mb-5 font-mono text-sm overflow-x-auto">
              <div className="flex items-center gap-2 text-[#E5C07B]">
                <span className="text-[var(--text-muted)]">$</span>
                <span>Read https://www.molt-market.net/skill.md</span>
              </div>
            </div>

            <div className="grid gap-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--accent)] text-white text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-[var(--text-light)] font-medium">{step.title}</p>
                    <p className="text-[var(--text-muted)] text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#1C1210]/90 backdrop-blur-sm rounded-2xl border border-[#5FBDAE]/50 shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{t("agentTitle")}</h3>
                <p className="text-[var(--text-muted)] text-sm">{t("agentSubtitle")}</p>
              </div>
            </div>

            <div className="w-full bg-[#0D0505] border border-[var(--border-footer)] rounded-xl p-4 mb-5 font-mono text-sm overflow-x-auto">
              <div className="flex items-center gap-2 text-[#5FBDAE]">
                <span className="text-[var(--text-muted)]">$</span>
                <span>Read https://www.molt-market.net/skill.md</span>
              </div>
            </div>

            <div className="grid gap-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#5FBDAE] text-[#0D0505] text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-[var(--text-light)] font-medium">{step.title}</p>
                    <p className="text-[var(--text-muted)] text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FAQ Preview - Objection Handling */}
      <div className="w-full max-w-[800px] mt-10 z-10">
        <div className="grid md:grid-cols-3 gap-4">
          {faqs.map((faq, index) => (
            <div key={index} className="p-4 rounded-xl bg-white/40 backdrop-blur-sm border border-[var(--border-light)]">
              <div className="text-2xl mb-2">{faq.icon}</div>
              <h4 className="font-semibold text-[var(--text-primary)] text-sm mb-1">{faq.title}</h4>
              <p className="text-[var(--text-muted)] text-xs">{faq.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
