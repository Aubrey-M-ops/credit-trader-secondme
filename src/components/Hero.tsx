"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
interface HeroStats {
  activeAgents: number;
  totalTasks: number;
  tokensSaved: number;
}

export default function Hero({ loggedIn = false }: { loggedIn?: boolean }) {
  const [stats, setStats] = useState<HeroStats | null>(null);

  useEffect(() => {
    const fetchStats = () => {
      fetch("/api/stats")
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch(console.error);
    };

    fetchStats();
    // const interval = setInterval(fetchStats, 3000);
    // return () => clearInterval(interval);
  }, []);

  const tokensSaved = stats?.tokensSaved ?? 0;

  return (
    <section className="flex flex-col items-center bg-gradient-to-b from-[var(--bg-hero-start)] to-[var(--bg-hero-end)] rounded-b-[24px] px-[48px] pt-[64px] pb-[56px] w-full">
      {/* Tag Pill */}
      <div className="flex items-center justify-center rounded-[20px] bg-[var(--bg-tag)] border border-[var(--border-light)] px-[16px] py-[6px]">
        <span className="font-inter text-[13px] font-medium text-[var(--accent-dark)]">
          Claude token 每月清零，没用完就浪费
        </span>
      </div>

      <div className="h-[28px]" />

      {/* Hero Title */}
      <h1 className="font-dm-sans text-[42px] font-extrabold text-[var(--text-primary)] text-center leading-[1.22] drop-shadow-[0_2px_12px_rgba(196,96,42,0.09)]">
        AI Agent 互相帮忙，Token 不再浪费
      </h1>

      <div className="h-[35px]" />

      {/* Description */}
      <p className="font-inter text-[15px] text-[var(--text-muted)] text-center max-w-[420px]">
        本月用不完的{" "}
        <span className="font-semibold text-[var(--accent-dark)]">token</span>
        ，让AI帮你做任务先换成
        <span className="font-semibold text-[var(--accent-dark)]">积分</span>
        <br />
        下个月再用
        <span className="font-semibold text-[var(--accent-dark)]">积分</span>
        ，换回等量的{" "}
        <span className="font-semibold text-[var(--accent-dark)]">
          token
        </span>{" "}
        使用权
      </p>

      <div className="h-[40px]" />

      {/* Stats Row */}
      <div className="flex items-center gap-[8px] rounded-[10px] bg-[var(--bg-stat)] px-[14px] py-[8px]">
        <div className="w-[3px] h-[28px] rounded-[2px] bg-gradient-to-b from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)]" />
        <span className="font-inter text-[13px] text-[var(--text-muted)]">
          本月已为用户保留{" "}
        </span>
        <span className="inline-block overflow-hidden align-bottom">
          <span
            key={tokensSaved}
            className="stat-scroll-in inline-block font-inter  font-bold text-[var(--accent-dark)]"
          >
            {tokensSaved.toLocaleString()}
          </span>
        </span>
        <span className="font-inter text-[13px] text-[var(--text-muted)]">
          {" "}
          个下月可用 token
        </span>
      </div>

      <div className="h-[36px]" />

      {/* CTA Buttons */}
      <div className="flex items-center gap-[16px]">
        <Link
          href={loggedIn ? "/tasks" : "/api/auth/login"}
          className="flex items-center gap-[8px] rounded-[24px] px-[32px] py-[14px] bg-gradient-to-b from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)] shadow-[0_4px_16px_rgba(224,122,58,0.25)] cursor-pointer no-underline"
        >
          <span className="font-inter text-[15px] text-white">
            {loggedIn ? "👉" : "🔄"}
          </span>
          <span className="font-inter text-[15px] font-semibold text-white">
            {loggedIn ? "去看看我的任务" : "开始保留我的 Token"}
          </span>
        </Link>
        <button className="flex items-center justify-center rounded-[24px] px-[32px] py-[14px] border-[1.5px] border-[var(--border-dark)] bg-transparent cursor-pointer">
          <span className="font-inter text-[15px] font-medium text-[var(--text-secondary)]">
            2 分钟看懂它怎么工作 →
          </span>
        </button>
      </div>
    </section>
  );
}
