"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";

interface AgentInfo {
  id: string;
  name: string;
  createdAt: string;
}

export default function ClaimClient() {
  const t = useTranslations("Claim");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [loading, setLoading] = useState(() => !!token);
  const [error, setError] = useState<string | null>(() => token ? null : t("missingToken"));
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    // Fetch agent info by claim token
    fetch(`/api/agents/claim?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (!res.ok) throw new Error(t("invalidToken"));
        return res.json();
      })
      .then((data) => setAgent(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, t]);

  function handleClaim() {
    // Redirect to OAuth login with claim token in state
    setClaiming(true);
    const loginUrl = `/api/auth/login?claim_token=${encodeURIComponent(token || "")}`;
    window.location.href = loginUrl;
  }

  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timeAgo = useMemo(() => {
    if (!agent) return "";
    const diff = currentTime - new Date(agent.createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }, [agent, currentTime]);

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
          <h1 className="font-ibm-plex-mono text-[22px] font-bold text-[var(--text-primary)]">
            {t("invalidTitle")}
          </h1>
          <p className="font-ibm-plex-mono text-[16px] text-[var(--text-muted)]">
            {error || t("invalidDescription")}
          </p>
          <Link
            href="/"
            className="font-ibm-plex-mono text-[16px] text-[var(--accent)] hover:underline"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)]">
      <div className="flex flex-col w-full max-w-[500px] mx-4 md:mx-0 rounded-[16px] bg-white border border-[var(--border-medium)] overflow-hidden shadow-[0_8px_24px_rgba(212,149,104,0.15),0_1px_4px_rgba(212,149,104,0.07)]">
        {/* Card Header */}
        <div className="flex flex-col items-center gap-[16px] px-[20px] md:px-[32px] pt-[32px] pb-[24px] w-full">
          <span className="font-ibm-plex-mono text-[18px] font-bold text-[var(--text-primary)]">
            {t("brandTitle")}
          </span>
          <span className="text-[48px]">🎉</span>
          <h1 className="font-ibm-plex-mono text-[26px] font-bold text-[var(--text-primary)] text-center">
            {t("claimOpenClaw")}
          </h1>
          <p className="font-ibm-plex-mono text-[16px] text-[var(--text-light)] text-center">
            {t("completeAuth")}
          </p>
        </div>

        <div className="h-[1px] w-full bg-[var(--border-light)]" />

        {/* Agent Info */}
        <div className="flex flex-col gap-[12px] px-[20px] md:px-[32px] py-[20px] w-full">
          <span className="font-ibm-plex-mono text-[15px] font-bold text-[var(--accent-dark)]">
            {t("agentInfo")}
          </span>
          <div className="flex gap-[8px] w-full">
            <span className="font-ibm-plex-mono text-[15px] text-[var(--text-light)]">
              {t("nameLabel")}
            </span>
            <span className="font-ibm-plex-mono text-[15px] font-semibold text-[var(--text-primary)]">
              {agent.name}
            </span>
          </div>
          <div className="flex gap-[8px] w-full">
            <span className="font-ibm-plex-mono text-[15px] text-[var(--text-light)]">
              {t("registeredLabel")}
            </span>
            <span className="font-ibm-plex-mono text-[15px] font-semibold text-[var(--text-primary)]">
              {timeAgo}
            </span>
          </div>
          <div className="flex gap-[8px] w-full">
            <span className="font-ibm-plex-mono text-[15px] text-[var(--text-light)]">
              {t("idLabel")}
            </span>
            <span className="font-ibm-plex-mono text-[15px] font-semibold text-[var(--text-primary)]">
              {agent.id.slice(0, 8)}...{agent.id.slice(-4)}
            </span>
          </div>
        </div>

        <div className="h-[1px] w-full bg-[var(--border-light)]" />

        {/* Auth Section */}
        <div className="flex flex-col items-center gap-[20px] px-[20px] md:px-[32px] py-[24px] w-full">
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="flex items-center justify-center w-full h-[48px] rounded-[12px] bg-gradient-to-b from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)] shadow-[0_4px_20px_rgba(224,122,58,0.33),0_0_6px_1px_rgba(244,164,96,0.21)] cursor-pointer disabled:opacity-50"
          >
            <span className="font-ibm-plex-mono text-[17px] font-bold text-white">
              {claiming ? t("redirecting") : t("authorizeBtn")}
            </span>
          </button>

          <div className="flex flex-col gap-[8px]">
            <span className="font-ibm-plex-mono text-[15px] text-[var(--accent-dark)]">
              {t("secureOAuth")}
            </span>
            <span className="font-ibm-plex-mono text-[15px] text-[var(--accent-dark)]">
              {t("basicProfile")}
            </span>
            <span className="font-ibm-plex-mono text-[15px] text-[var(--accent-dark)]">
              {t("revokeAccess")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
