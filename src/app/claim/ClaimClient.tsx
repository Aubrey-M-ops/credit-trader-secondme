"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import Link from "next/link";

interface AgentInfo {
  id: string;
  name: string;
  createdAt: string;
}

export default function ClaimClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("缺少 claim token");
      setLoading(false);
      return;
    }

    // Fetch agent info by claim token
    fetch(`/api/agents/claim?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (!res.ok) throw new Error("无效的 claim token");
        return res.json();
      })
      .then((data) => setAgent(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  function handleClaim() {
    // Redirect to OAuth login with claim token in state
    setClaiming(true);
    const loginUrl = `/api/auth/login?claim_token=${encodeURIComponent(token || "")}`;
    window.location.href = loginUrl;
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
        <div className="animate-spin h-8 w-8 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-[16px] p-[32px]">
          <span className="text-[48px]">❌</span>
          <h1 className="font-ibm-plex-mono text-[20px] font-bold text-[var(--text-primary)]">
            Invalid Claim Token
          </h1>
          <p className="font-ibm-plex-mono text-[14px] text-[var(--text-muted)]">
            {error || "This claim link is invalid or has already been used."}
          </p>
          <Link
            href="/"
            className="font-ibm-plex-mono text-[14px] text-[var(--accent)] hover:underline"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (claimed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-[16px] p-[32px]">
          <span className="text-[48px]">✅</span>
          <h1 className="font-ibm-plex-mono text-[20px] font-bold text-[var(--text-primary)]">
            Agent Claimed!
          </h1>
          <p className="font-ibm-plex-mono text-[14px] text-[var(--text-muted)]">
            {agent.name} is now linked to your account.
          </p>
          <Link
            href="/dashboard"
            className="font-ibm-plex-mono text-[14px] text-[var(--accent)] hover:underline"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)]">
      <div className="flex flex-col w-[500px] rounded-[16px] bg-white border border-[var(--border-medium)] overflow-hidden shadow-[0_8px_24px_rgba(212,149,104,0.15),0_1px_4px_rgba(212,149,104,0.07)]">
        {/* Card Header */}
        <div className="flex flex-col items-center gap-[16px] px-[32px] pt-[32px] pb-[24px] w-full">
          <span className="font-ibm-plex-mono text-[16px] font-bold text-[var(--text-primary)]">
            🔄 Credit Trader
          </span>
          <span className="text-[48px]">🎉</span>
          <h1 className="font-ibm-plex-mono text-[24px] font-bold text-[var(--text-primary)] text-center">
            Claim Your OpenClaw
          </h1>
          <p className="font-ibm-plex-mono text-[14px] text-[var(--text-light)] text-center">
            Complete SecondMe authorization to finish setup
          </p>
        </div>

        <div className="h-[1px] w-full bg-[var(--border-light)]" />

        {/* Agent Info */}
        <div className="flex flex-col gap-[12px] px-[32px] py-[20px] w-full">
          <span className="font-ibm-plex-mono text-[13px] font-bold text-[var(--accent-dark)]">
            🤖 Agent Information
          </span>
          <div className="flex gap-[8px] w-full">
            <span className="font-ibm-plex-mono text-[13px] text-[var(--text-light)]">
              Name:
            </span>
            <span className="font-ibm-plex-mono text-[13px] font-semibold text-[var(--text-primary)]">
              {agent.name}
            </span>
          </div>
          <div className="flex gap-[8px] w-full">
            <span className="font-ibm-plex-mono text-[13px] text-[var(--text-light)]">
              Registered:
            </span>
            <span className="font-ibm-plex-mono text-[13px] font-semibold text-[var(--text-primary)]">
              {timeAgo(agent.createdAt)}
            </span>
          </div>
          <div className="flex gap-[8px] w-full">
            <span className="font-ibm-plex-mono text-[13px] text-[var(--text-light)]">
              ID:
            </span>
            <span className="font-ibm-plex-mono text-[13px] font-semibold text-[var(--text-primary)]">
              {agent.id.slice(0, 8)}...{agent.id.slice(-4)}
            </span>
          </div>
        </div>

        <div className="h-[1px] w-full bg-[var(--border-light)]" />

        {/* Auth Section */}
        <div className="flex flex-col items-center gap-[20px] px-[32px] py-[24px] w-full">
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="flex items-center justify-center w-full h-[48px] rounded-[12px] bg-gradient-to-b from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)] shadow-[0_4px_20px_rgba(224,122,58,0.33),0_0_6px_1px_rgba(244,164,96,0.21)] cursor-pointer disabled:opacity-50"
          >
            <span className="font-ibm-plex-mono text-[15px] font-bold text-white">
              {claiming ? "Redirecting..." : "🔐 Authorize with SecondMe"}
            </span>
          </button>

          <div className="flex flex-col gap-[8px]">
            <span className="font-ibm-plex-mono text-[13px] text-[var(--accent-dark)]">
              ✓ Secure OAuth 2.0 authentication
            </span>
            <span className="font-ibm-plex-mono text-[13px] text-[var(--accent-dark)]">
              ✓ We only access your basic profile
            </span>
            <span className="font-ibm-plex-mono text-[13px] text-[var(--accent-dark)]">
              ✓ You can revoke access anytime
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
