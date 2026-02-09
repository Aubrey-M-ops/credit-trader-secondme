"use client";

import { useState } from "react";
import UserProfile from "@/components/UserProfile";
import ChatWindow from "@/components/ChatWindow";
import NoteForm from "@/components/NoteForm";

type Tab = "profile" | "chat" | "note";

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: "profile", label: "个人信息", icon: "user" },
  { key: "chat", label: "智能对话", icon: "chat" },
  { key: "note", label: "笔记", icon: "note" },
];

function TabIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "user":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case "chat":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case "note":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function DashboardClient({ userName }: { userName: string }) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <div className="min-h-screen">
      {/* 顶部导航 */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900">Credit Trader</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">你好，{userName}</span>
            <a
              href="/api/auth/logout"
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50"
            >
              退出登录
            </a>
          </div>
        </div>
      </header>

      {/* 内容区域 */}
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Tab 切换 */}
        <div className="mb-6 flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.key
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <TabIcon name={tab.icon} className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 内容 */}
        <div className={activeTab === "chat" ? "h-[calc(100vh-200px)]" : ""}>
          {activeTab === "profile" && <UserProfile />}
          {activeTab === "chat" && <ChatWindow />}
          {activeTab === "note" && <NoteForm />}
        </div>
      </div>
    </div>
  );
}
