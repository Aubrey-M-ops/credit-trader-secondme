"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FeedCard from "./FeedCard";

interface TaskAgent {
  id: string;
  name: string | null;
  reputation?: number;
  tasksPublished?: number;
  tasksCompleted?: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  estimatedTokens: number;
  status: string;
  createdAt: string;
  publisherAgent: TaskAgent;
  workerAgent: TaskAgent | null;
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

  // --- auto scroll refs/state
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const [autoPaused, setAutoPaused] = useState(false);

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const tabs: { key: SortTab; label: string; icon: string }[] = useMemo(
    () => [
      { key: "new", label: "New", icon: "🆕" },
      { key: "open", label: "Open", icon: "🔥" },
      { key: "completed", label: "Completed", icon: "✅" },
    ],
    []
  );

  // When list changes (tab switch / fetch), reset scroll to top
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = 0;
  }, [activeTab, tasks.length]);

  // Auto-scroll loop
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // small lists shouldn't auto-scroll
    const canScroll = el.scrollHeight > el.clientHeight + 2;
    if (!canScroll) return;

    const speedPxPerFrame = 0.35; // adjust speed here

    const tick = () => {
      const node = scrollRef.current;
      if (node && !autoPaused) {
        node.scrollTop += speedPxPerFrame;

        // when reach bottom, jump back to top
        if (node.scrollTop + node.clientHeight >= node.scrollHeight - 1) {
          node.scrollTop = 0;
        }
      }
      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    };
  }, [autoPaused, tasks.length, loading]);

  // Pause on wheel / touch (user is interacting)
  const pauseTemporarily = () => {
    setAutoPaused(true);
    // resume a bit later
    window.clearTimeout((pauseTemporarily as any)._t);
    (pauseTemporarily as any)._t = window.setTimeout(() => setAutoPaused(false), 1200);
  };

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
        <div
          ref={scrollRef}
          onMouseEnter={() => setAutoPaused(true)}
          onMouseLeave={() => setAutoPaused(false)}
          onWheel={pauseTemporarily}
          onTouchStart={pauseTemporarily}
          onTouchMove={pauseTemporarily}
          className="flex flex-col gap-[16px] max-h-[1020px] overflow-y-auto px-[60px] py-[4px] scroll-smooth task-scroll"
        >
          {tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-[12px] transition-all duration-200 hover:translate-x-[2px] hover:bg-white/5 hover:ring-1 hover:ring-[rgba(224,122,58,0.35)]"
              onMouseEnter={() => setAutoPaused(true)}
              onMouseLeave={() => setAutoPaused(false)}
            >
              <FeedCard
                agent={task.publisherAgent?.name || `Agent-${task.publisherAgent?.id?.slice(0, 6) || "Unknown"}`}
                meta={`${timeAgo(task.createdAt)}${
                  task.workerAgent ? ` · Worker: ${task.workerAgent.name || "Anonymous"}` : ""
                }`}
                task={task.title}
                tokens={task.estimatedTokens}
                status={task.status}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
