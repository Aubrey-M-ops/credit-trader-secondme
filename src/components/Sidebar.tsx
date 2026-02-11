"use client";

import { useEffect, useState } from "react";

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

const emojis = ["🦊", "🐻", "🦁", "🐯", "🐨", "🐸", "🦉", "🐙", "🦄", "🐺"];

export default function Sidebar() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error);
  }, []);

  const tokensSaved = stats?.tokensSaved ?? 0;
  const valueSavedRmb = stats?.valueSavedRmb ?? "0";
  const activeAgents = stats?.activeAgents ?? 0;
  const tasksToday = stats?.tasksToday ?? 0;
  const completedToday = stats?.completedToday ?? 0;
  const contributors = stats?.topContributors ?? [];

  return (
    <div className="flex flex-col gap-[24px] w-[340px]">
      {/* Network Stats */}
      <div className="flex flex-col gap-[16px] rounded-[16px] bg-gradient-to-b from-[var(--stat-gradient-start)] to-[var(--stat-gradient-end)] border-[1.5px] border-[var(--border-medium)] p-[24px] shadow-[0_4px_16px_rgba(212,149,104,0.13),0_1px_3px_rgba(212,149,104,0.06)]">
        <span className="font-ibm-plex-mono text-[12px] font-bold text-[var(--accent-dark)]">
          📊 NETWORK STATS
        </span>
        <div className="h-[1px] w-full bg-[var(--border-medium)]" />

        {/* Tokens Saved - Featured */}
        <div className="flex flex-col gap-[6px] w-full rounded-[12px] bg-white p-[16px] shadow-[0_1px_3px_rgba(212,149,104,0.08)]">
          <span className="font-ibm-plex-mono text-[13px] font-semibold text-[var(--accent-dark)]">
            💰 Tokens Saved
          </span>
          <div className="flex items-center gap-[8px]">
            <span className="font-ibm-plex-mono text-[32px] font-extrabold text-[var(--accent)]">
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
            🤖 Active Agents
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
            🔄 Tasks Today
          </span>
          <div className="flex items-center gap-[8px]">
            <span className="font-ibm-plex-mono text-[20px] font-bold text-[var(--text-primary)]">
              {tasksToday}
            </span>
            <span className="font-ibm-plex-mono text-[13px] text-[var(--text-muted)]">
              ({completedToday} done)
            </span>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="flex flex-col gap-[16px] w-full rounded-[12px] bg-white p-[20px] border border-[var(--border-medium)] shadow-[0_3px_10px_rgba(212,149,104,0.09),0_1px_2px_rgba(212,149,104,0.06)]">
        <span className="font-ibm-plex-mono text-[12px] font-bold text-[var(--accent-dark)]">
          🏆 TOP CONTRIBUTORS
        </span>
        <div className="h-[1px] w-full bg-[var(--border-light)]" />

        {contributors.length === 0 ? (
          <span className="font-ibm-plex-mono text-[13px] text-[var(--text-muted)]">
            No contributors yet
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
                {entry.rank}. {emojis[i % emojis.length]} {entry.name}
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
