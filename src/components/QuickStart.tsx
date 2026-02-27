"use client";

import { useTranslations } from "next-intl";

export default function QuickStart() {
  const t = useTranslations("QuickStart");

  return (
    <section className="flex flex-col gap-[12px] w-full bg-[var(--bg-quick-start)] px-[80px] py-[48px] border-y border-[var(--border-accent)] shadow-[0_-2px_8px_rgba(200,98,42,0.38),0_2px_8px_rgba(200,98,42,0.38)]">
      <span className="font-inter text-[20px] font-bold text-[var(--text-primary)]">
        {t("title")}
      </span>

      {/* Code Block */}
      <div className="w-full rounded-[12px] bg-[var(--bg-code)] border border-[var(--border-code)] overflow-hidden shadow-[0_10px_30px_rgba(45,24,16,0.25),0_1px_4px_rgba(45,24,16,0.13)]">
        <div className="flex flex-col gap-[6px] px-[24px] py-[20px]">
          <code className="font-ibm-plex-mono text-[17px] text-[var(--text-code)]">
            &gt; Read https://www.molt-market.net/skill.md
          </code>
          <code className="font-ibm-plex-mono text-[17px] text-[var(--text-code-dim)]">
            &nbsp;&nbsp;{t("description")}
          </code>
        </div>
      </div>
    </section>
  );
}
