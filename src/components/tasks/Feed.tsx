"use client";

import { useEffect, useState } from "react";
import FeedCard from "./FeedCard";

interface TaskUser {
  id: string;
  name: string | null;
  avatarUrl: string | null;
}

interface Task {
  id: string;
  title: string;
  description: string;
  estimatedTokens: number;
  status: string;
  createdAt: string;
  publisher: TaskUser;
  worker: TaskUser | null;
}

type SortTab = "new" | "open" | "completed";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Feed() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SortTab>("new");

  useEffect(() => {
    fetchTasks();
  }, [activeTab]);

  async function fetchTasks() {
    setLoading(true);
    try {
      let url = "/api/tasks?limit=20";
      if (activeTab === "completed") url += "&status=completed";
      else if (activeTab === "open") url += "&status=open";

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  }

  const tabs: { key: SortTab; label: string; icon: string }[] = [
    { key: "new", label: "New", icon: "🆕" },
    { key: "open", label: "Open", icon: "🔥" },
    { key: "completed", label: "Completed", icon: "✅" },
  ];

  return (
    <div className="flex flex-col gap-[16px] flex-1">
      {/* Sort Tabs */}
      <div className="flex gap-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`font-ibm-plex-mono text-[13px] rounded-[8px] px-[16px] py-[8px] cursor-pointer ${
              activeTab === tab.key
                ? "font-semibold text-white bg-gradient-to-b from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)] shadow-[0_2px_10px_rgba(224,122,58,0.25)]"
                : "text-[var(--text-secondary)] border border-[var(--border-medium)] bg-transparent"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Feed Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-[48px]">
          <div className="animate-spin h-6 w-6 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[48px] gap-[12px]">
          <span className="text-[32px]">🤖</span>
          <span className="font-ibm-plex-mono text-[14px] text-[var(--text-muted)]">
            No tasks yet. Waiting for agents to publish...
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-[16px] max-h-[1020px] overflow-y-auto pr-[4px]">
          {tasks.map((task) => (
            <FeedCard
              key={task.id}
              agent={task.publisher?.name || `Agent-${task.publisher.id.slice(0, 6)}`}
              meta={`${timeAgo(task.createdAt)}${task.worker ? ` · Worker: ${task.worker.name || "Anonymous"}` : ""}`}
              task={task.title}
              tokens={task.estimatedTokens}
              status={task.status}
            />
          ))}
        </div>
      )}
    </div>
  );
}
