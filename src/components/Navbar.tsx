"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";

export default function Navbar({
  userName,
  activePath = "/",
}: {
  userName?: string;
  activePath?: string;
}) {
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { href: "/" as const, label: t("home") },
    { href: "/overview" as const, label: t("overview") },
  ];

  function switchLocale() {
    const nextLocale = locale === "en" ? "zh" : "en";
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-[16px] md:px-[48px] h-[60px] bg-[var(--bg-primary)]/95 backdrop-blur-sm border-b border-[var(--border-light)]">
      {/* Left: Logo */}
      <Link href="/" className="flex items-center gap-[8px] cursor-pointer hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-lg shadow-lg shadow-orange-500/20">
          🦞
        </div>
        <div className="flex flex-col">
          <span className="font-ibm-plex-mono text-[18px] font-bold text-[var(--text-primary)] leading-tight">
            moltmarket
          </span>
          <span className="text-[12px] text-[var(--text-muted)] leading-tight hidden sm:block">
            {t("tokenMarket")}
          </span>
        </div>
      </Link>

      {/* Center: Nav links */}
      <div className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => {
          const isActive =
            link.href === "/"
              ? activePath === "/"
              : activePath.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg font-inter text-[16px] transition-colors ${
                isActive
                  ? "font-semibold text-[var(--accent)] bg-[var(--accent)]/10"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Right: Auth + Language Switcher */}
      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <button
          onClick={switchLocale}
          className="hidden sm:flex items-center px-3 py-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 transition-colors font-inter text-[15px] font-medium cursor-pointer"
        >
          {locale === "en" ? "中文" : "EN"}
        </button>

        <a
          href="https://github.com/Aubrey-M-ops/credit-trader-secondme"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span className="text-[15px] font-medium">GitHub</span>
        </a>

        {userName ? (
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-black/5 transition-colors"
            >
              <span className="text-sm">👋</span>
              <span className="font-inter text-[16px] max-w-[100px] truncate">{userName}</span>
            </Link>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/api/auth/logout"
              className="font-inter text-[15px] text-[var(--text-secondary)] rounded-lg px-4 py-2 border border-[var(--border-medium)] no-underline hover:bg-[var(--bg-tag)] transition-colors"
            >
              {t("logout")}
            </a>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-html-link-for-pages
          <a
            href="/api/auth/login"
            className="flex items-center justify-center font-inter text-[16px] font-semibold text-white rounded-[20px] px-5 py-2.5 bg-gradient-to-b from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)] shadow-[0_4px_16px_rgba(224,122,58,0.35)] hover:shadow-[0_6px_20px_rgba(224,122,58,0.45)] hover:scale-[1.02] transition-all"
          >
            {t("startEarning")}
          </a>
        )}
      </div>
    </nav>
  );
}
