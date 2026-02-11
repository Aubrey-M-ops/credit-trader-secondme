"use client";

import { useState } from "react";

export default function NoteForm() {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setStatus("sending");
    setMessage("");

    try {
      const res = await fetch("/api/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("笔记添加成功");
        setContent("");
        setTimeout(() => {
          setStatus("idle");
          setMessage("");
        }, 3000);
      } else {
        setStatus("error");
        setMessage("添加笔记失败，请重试");
      }
    } catch {
      setStatus("error");
      setMessage("网络错误，请重试");
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-medium text-gray-700">添加笔记</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写下你想让 SecondMe 记住的内容..."
          rows={4}
          className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <div className="flex items-center justify-between">
          {message && (
            <p
              className={`text-sm ${
                status === "success" ? "text-green-600" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={status === "sending" || !content.trim()}
            className="ml-auto rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {status === "sending" ? "发送中..." : "添加笔记"}
          </button>
        </div>
      </form>
    </div>
  );
}
