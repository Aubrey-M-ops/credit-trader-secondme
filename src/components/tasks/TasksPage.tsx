"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────

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
  status: string; // open, accepted, executing, completed, cancelled
  createdAt: string;
  completedAt: string | null;
  publisher: TaskUser;
  worker: TaskUser | null;
}

type TabKey = "accepted" | "published";

// ── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function statusIcon(status: string) {
  switch (status) {
    case "open":
      return "📝";
    case "accepted":
      return "🤝";
    case "executing":
      return "⚡";
    case "completed":
      return "✅";
    case "cancelled":
      return "❌";
    default:
      return "📝";
  }
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "completed":
      return "bg-[#E8F5E9] text-[#388E3C] border-[#A5D6A7]";
    case "open":
      return "bg-[#FFFDE7] text-[#B8860B] border-[#FFE082]";
    default:
      return "bg-[#FFF0E3] text-[var(--accent-dark)] border-[#F0C8A0]";
  }
}

function cardBorderClass(status: string) {
  switch (status) {
    case "completed":
      return "border-[#C8E6C9] bg-[#FAFFF8]";
    case "open":
      return "border-[#E8DFB0] bg-[#FFFDF8]";
    default:
      return "border-[var(--border-medium)] bg-white";
  }
}

// ── Sub-components ─────────────────────────────────────────────────────────

function TaskCard({ task, role, t }: { task: Task; role: TabKey; t: ReturnType<typeof useTranslations<"Tasks">> }) {
  function getStatusLabel(status: string) {
    switch (status) {
      case "open": return t("statusOpen");
      case "accepted": return t("statusAccepted");
      case "executing": return t("statusExecuting");
      case "completed": return t("statusCompleted");
      case "cancelled": return t("statusCancelled");
      default: return status;
    }
  }

  const meta =
    role === "accepted"
      ? `${t("publisherLabel")}: 🤖 ${task.publisher?.name || "Anonymous"} · ${timeAgo(task.createdAt)}`
      : task.worker
        ? `${t("workerLabel")}: 🤖 ${task.worker.name || "Anonymous"} · ${timeAgo(task.createdAt)}`
        : `${t("statusLabel")}: ${t("waitingForAcceptance")} · ${t("publishedAt")} ${timeAgo(task.createdAt)}`;

  const tokenText =
    task.status === "completed"
      ? t("earnedTokens", { count: task.estimatedTokens })
      : t("estTokens", { count: task.estimatedTokens });

  return (
    <div
      className={`flex flex-col gap-[10px] p-[20px] rounded-[12px] border shadow-[0_3px_10px_rgba(212,149,104,0.09),0_1px_2px_rgba(212,149,104,0.06)] transition-all duration-200 hover:shadow-[0_6px_20px_rgba(212,149,104,0.18),0_2px_6px_rgba(212,149,104,0.1)] hover:-translate-y-[2px] hover:border-[var(--accent)] cursor-pointer ${cardBorderClass(task.status)}`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-[8px]">
          <span className="text-[14px]">{statusIcon(task.status)}</span>
          <span className="font-ibm-plex-mono text-[14px] font-bold text-[var(--text-primary)]">
            {task.title}
          </span>
        </div>
        <span
          className={`font-ibm-plex-mono text-[11px] font-semibold px-[10px] py-[3px] rounded-[6px] border ${statusBadgeClass(task.status)}`}
        >
          {getStatusLabel(task.status)}
        </span>
      </div>
      <span className="font-ibm-plex-mono text-[12px] text-[var(--text-muted)]">
        {meta}
      </span>
      <div className="flex items-center justify-between w-full">
        <span
          className={`font-ibm-plex-mono text-[12px] font-semibold ${
            task.status === "completed"
              ? "text-[#388E3C]"
              : "text-[var(--accent-dark)]"
          }`}
        >
          {tokenText}
        </span>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function TasksPage() {
  const t = useTranslations("Tasks");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("accepted");
  const [acceptedTasks, setAcceptedTasks] = useState<Task[]>([]);
  const [publishedTasks, setPublishedTasks] = useState<Task[]>([]);
  const [loadingAccepted, setLoadingAccepted] = useState(true);
  const [loadingPublished, setLoadingPublished] = useState(true);
  const [needLogin, setNeedLogin] = useState(false);

  useEffect(() => {
    async function fetchMyTasks() {
      const [workerRes, publisherRes] = await Promise.all([
        fetch("/api/tasks?role=worker&limit=50"),
        fetch("/api/tasks?role=publisher&limit=50"),
      ]);

      if (workerRes.status === 401 || publisherRes.status === 401) {
        setNeedLogin(true);
        setLoadingAccepted(false);
        setLoadingPublished(false);
        return;
      }

      if (workerRes.ok) {
        const data = await workerRes.json();
        setAcceptedTasks(data.tasks);
      }
      setLoadingAccepted(false);

      if (publisherRes.ok) {
        const data = await publisherRes.json();
        setPublishedTasks(data.tasks);
      }
      setLoadingPublished(false);
    }

    fetchMyTasks().catch(() => {
      setLoadingAccepted(false);
      setLoadingPublished(false);
    });
  }, [router]);

  const tabs: { key: TabKey; label: string; icon: string; count: number }[] = [
    {
      key: "accepted",
      label: t("tabAccepted"),
      icon: "🔽",
      count: acceptedTasks.length,
    },
    {
      key: "published",
      label: t("tabPublished"),
      icon: "🔼",
      count: publishedTasks.length,
    },
  ];

  const currentTasks =
    activeTab === "accepted" ? acceptedTasks : publishedTasks;
  const isLoading =
    activeTab === "accepted" ? loadingAccepted : loadingPublished;

  return (
    <div className="flex flex-col gap-[24px] md:gap-[32px] w-full px-[16px] md:px-[48px] py-[32px]">
      {/* Page header */}
      <div className="flex flex-col gap-[16px] md:flex-row md:items-center md:justify-between w-full">
        <span className="font-dm-sans text-[20px] md:text-[24px] font-bold text-[var(--text-primary)]">
          {t("pageTitle")}
        </span>
        <div className="flex gap-[8px]">
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
              {tab.icon} {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Not logged in */}
      {needLogin ? (
        <div className="flex flex-col items-center justify-center py-[64px] gap-[16px]">
          <span className="text-[36px]">🔒</span>
          <span className="font-ibm-plex-mono text-[16px] text-[var(--text-primary)] font-semibold">
            {t("loginRequired")}
          </span>
          <span className="font-ibm-plex-mono text-[13px] text-[var(--text-muted)]">
            {t("loginDescription")}
          </span>
          <Link
            href="/api/auth/login"
            className="font-ibm-plex-mono text-[14px] font-semibold text-white rounded-[20px] px-[28px] py-[10px] bg-gradient-to-b from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)] shadow-[0_4px_20px_rgba(224,122,58,0.38)] no-underline"
          >
            {t("login")}
          </Link>
        </div>
      ) : null}

      {/* Task list — max 6 visible, scroll for more */}
      {!needLogin &&
        (isLoading ? (
          <div className="flex items-center justify-center py-[48px]">
            <div className="animate-spin h-6 w-6 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
          </div>
        ) : currentTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[48px] gap-[12px]">
            <span className="text-[32px]">🤖</span>
            <span className="font-ibm-plex-mono text-[14px] text-[var(--text-muted)]">
              {activeTab === "accepted"
                ? t("noAccepted")
                : t("noPublished")}
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-[16px] max-h-[636px] overflow-y-auto px-[4px] py-[4px] scroll-smooth task-scroll">
            {currentTasks.map((task) => (
              <TaskCard key={task.id} task={task} role={activeTab} t={t} />
            ))}
          </div>
        ))}
    </div>
  );
}
