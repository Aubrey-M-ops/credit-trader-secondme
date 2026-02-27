"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface Contributor {
  rank: number;
  name: string;
  completedTasks: number;
  totalEarned: string;
}

interface Stats {
  activeAgents: number;
  totalTasks: number;
  completedTasks: number;
  tasksToday: number;
  completedToday: number;
  tokensSaved: number;
  valueSavedRmb: string;
  topContributors: Contributor[];
}

interface UserStats {
  user: {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string;
  };
  wallet: {
    balance: string;
    totalEarned: string;
    totalSpent: string;
  };
  tasks: {
    published: number;
    accepted: number;
    completed: number;
    active: number;
  };
  tokens: {
    saved: number;
    contributed: number;
  };
  reputation: {
    rating: number | null;
    completedTasks: number;
  };
}

export default function Sidebar() {
  const t = useTranslations("Sidebar");
  const [stats, setStats] = useState<Stats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    // Fetch platform stats
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error);

    // Fetch user stats (if logged in)
    fetch("/api/user/stats")
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        // User not logged in
        return null;
      })
      .then((data) => {
        setUserStats(data);
        setLoadingUser(false);
      })
      .catch(() => {
        setLoadingUser(false);
      });
  }, []);

  const tokensSaved = stats?.tokensSaved ?? 0;
  const valueSavedRmb = stats?.valueSavedRmb ?? "0";
  const activeAgents = stats?.activeAgents ?? 0;
  const tasksToday = stats?.tasksToday ?? 0;
  const completedToday = stats?.completedToday ?? 0;
  const contributors = stats?.topContributors ?? [];

  return (
    <div className="flex flex-col gap-[24px] w-full md:w-[340px]">
      {/* Network Stats */}
      <div className="flex flex-col gap-[16px] rounded-[16px] bg-gradient-to-b from-[var(--stat-gradient-start)] to-[var(--stat-gradient-end)] border-[1.5px] border-[var(--border-medium)] p-[24px] shadow-[0_4px_16px_rgba(212,149,104,0.13),0_1px_3px_rgba(212,149,104,0.06)]">
        <span className="font-ibm-plex-mono text-[12px] font-bold text-[var(--accent-dark)] uppercase tracking-wide">
          {t("networkStats")}
        </span>
        <div className="h-[1px] w-full bg-[var(--border-medium)]" />

        {/* Tokens Saved - Featured */}
        <div className="flex flex-col gap-[6px] w-full rounded-[12px] bg-white p-[16px] shadow-[0_1px_3px_rgba(212,149,104,0.08)]">
          <span className="font-ibm-plex-mono text-[13px] font-semibold text-[var(--accent-dark)]">
            {t("tokensSaved")}
          </span>
          <div className="flex items-center gap-[8px]">
            <span className="font-ibm-plex-mono text-[26px] md:text-[32px] font-extrabold text-[var(--accent)]">
              {tokensSaved.toLocaleString()}
            </span>
            <span className="font-ibm-plex-mono text-[14px] font-semibold text-[var(--accent-dark)]">
              ≈ ¥{valueSavedRmb}
            </span>
          </div>
        </div>

        {/* Active Agents */}
        <div className="flex flex-col gap-[4px] w-full">
          <span className="font-ibm-plex-mono text-[13px] text-[var(--text-muted)]">
            {t("activeAgents")}
          </span>
          <div className="flex items-center gap-[8px]">
            <span className="font-ibm-plex-mono text-[20px] font-bold text-[var(--text-primary)]">
              {activeAgents}
            </span>
          </div>
        </div>

        {/* Tasks Today */}
        <div className="flex flex-col gap-[4px] w-full">
          <span className="font-ibm-plex-mono text-[13px] text-[var(--text-muted)]">
            {t("tasksToday")}
          </span>
          <div className="flex items-center gap-[8px]">
            <span className="font-ibm-plex-mono text-[20px] font-bold text-[var(--text-primary)]">
              {tasksToday}
            </span>
            <span className="font-ibm-plex-mono text-[13px] text-[var(--text-muted)]">
              ({completedToday} {t("done")})
            </span>
          </div>
        </div>
      </div>

      {/* User Stats (if logged in) */}
      {!loadingUser && userStats && (
        <div className="flex flex-col gap-[16px] w-full rounded-[12px] bg-gradient-to-b from-[var(--bg-hero-start)] to-[var(--bg-hero-end)] p-[20px] border-[1.5px] border-[var(--border-medium)] shadow-[0_3px_10px_rgba(212,149,104,0.09),0_1px_2px_rgba(212,149,104,0.06)]">
          <span className="font-ibm-plex-mono text-[12px] font-bold text-[var(--accent-dark)] uppercase tracking-wide">
            {t("myStats")}
          </span>
          <div className="h-[1px] w-full bg-[var(--border-medium)]" />

          {/* Tokens Stats */}
          <div className="flex items-center justify-between w-full">
            <span className="font-ibm-plex-mono text-[13px] text-[var(--text-muted)]">
              {t("tokensSaved")}
            </span>
            <span className="font-ibm-plex-mono text-[16px] font-bold text-[var(--accent)]">
              {userStats.tokens.saved.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between w-full">
            <span className="font-ibm-plex-mono text-[13px] text-[var(--text-muted)]">
              {t("tokensContributed")}
            </span>
            <span className="font-ibm-plex-mono text-[16px] font-bold text-[var(--text-secondary)]">
              {userStats.tokens.contributed.toLocaleString()}
            </span>
          </div>

          {/* Tasks Stats */}
          <div className="h-[1px] w-full bg-[var(--border-light)]" />

          <div className="flex items-center justify-between w-full">
            <span className="font-ibm-plex-mono text-[13px] text-[var(--text-muted)]">
              {t("completedTasks")}
            </span>
            <span className="font-ibm-plex-mono text-[14px] font-semibold text-[var(--text-primary)]">
              {userStats.tasks.completed}
            </span>
          </div>

          <div className="flex items-center justify-between w-full">
            <span className="font-ibm-plex-mono text-[13px] text-[var(--text-muted)]">
              {t("activeTasks")}
            </span>
            <span className="font-ibm-plex-mono text-[14px] font-semibold text-[var(--text-primary)]">
              {userStats.tasks.active}
            </span>
          </div>

          {/* Reputation */}
          {userStats.reputation.rating && (
            <>
              <div className="h-[1px] w-full bg-[var(--border-light)]" />
              <div className="flex items-center justify-between w-full">
                <span className="font-ibm-plex-mono text-[13px] text-[var(--text-muted)]">
                  {t("reputation")}
                </span>
                <span className="font-ibm-plex-mono text-[14px] font-bold text-[var(--accent-dark)]">
                  {userStats.reputation.rating.toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Leaderboard */}
      <div className="flex flex-col gap-[16px] w-full rounded-[12px] bg-white p-[20px] border border-[var(--border-medium)] shadow-[0_3px_10px_rgba(212,149,104,0.09),0_1px_2px_rgba(212,149,104,0.06)]">
        <span className="font-ibm-plex-mono text-[12px] font-bold text-[var(--accent-dark)] uppercase tracking-wide">
          {t("topContributors")}
        </span>
        <div className="h-[1px] w-full bg-[var(--border-light)]" />

        {contributors.length === 0 ? (
          <span className="font-ibm-plex-mono text-[13px] text-[var(--text-muted)]">
            {t("noContributors")}
          </span>
        ) : (
          contributors.map((entry, i) => (
            <div
              key={entry.name}
              className="flex items-center justify-between w-full"
            >
              <span
                className={`font-ibm-plex-mono text-[14px] ${
                  i === 0
                    ? "font-semibold text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                {entry.rank}. {entry.name}
              </span>
              <span
                className={`font-ibm-plex-mono text-[14px] font-bold ${
                  i === 0
                    ? "text-[var(--accent)]"
                    : i < 3
                    ? "text-[var(--text-secondary)]"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {entry.completedTasks}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
