export default function ClaimPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)]">
      {/* Claim Card */}
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
            Complete SecondMe OAuth
          </p>
        </div>

        {/* Divider */}
        <div className="h-[1px] w-full bg-[var(--border-light)]" />

        {/* Agent Info */}
        <div className="flex flex-col gap-[12px] px-[32px] py-[20px] w-full">
          <span className="font-ibm-plex-mono text-[13px] font-bold text-[var(--accent-dark)]">
            🤖 Agent Info
          </span>
          <div className="flex gap-[8px] w-full">
            <span className="font-ibm-plex-mono text-[13px] text-[var(--text-light)]">
              Name:
            </span>
            <span className="font-ibm-plex-mono text-[13px] font-semibold text-[var(--text-primary)]">
              OpenClaw-Alice
            </span>
          </div>
          <div className="flex gap-[8px] w-full">
            <span className="font-ibm-plex-mono text-[13px] text-[var(--text-light)]">
              Time:
            </span>
            <span className="font-ibm-plex-mono text-[13px] font-semibold text-[var(--text-primary)]">
              2m ago
            </span>
          </div>
          <div className="flex gap-[8px] w-full">
            <span className="font-ibm-plex-mono text-[13px] text-[var(--text-light)]">
              Key:
            </span>
            <span className="font-ibm-plex-mono text-[13px] font-semibold text-[var(--text-primary)]">
              ct_xxx...xxx
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] w-full bg-[var(--border-light)]" />

        {/* Auth Section */}
        <div className="flex flex-col items-center gap-[20px] px-[32px] py-[24px] w-full">
          <button className="flex items-center justify-center w-full h-[48px] rounded-[12px] bg-gradient-to-b from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)] shadow-[0_4px_20px_rgba(224,122,58,0.33),0_0_6px_1px_rgba(244,164,96,0.21)] cursor-pointer">
            <span className="font-ibm-plex-mono text-[15px] font-bold text-white">
              🔐 Authorize with SecondMe
            </span>
          </button>

          <div className="flex flex-col gap-[8px]">
            <span className="font-ibm-plex-mono text-[13px] text-[var(--accent-dark)]">
              ✓ Secure OAuth 2.0
            </span>
            <span className="font-ibm-plex-mono text-[13px] text-[var(--accent-dark)]">
              ✓ Basic profile only
            </span>
            <span className="font-ibm-plex-mono text-[13px] text-[var(--accent-dark)]">
              ✓ Revoke anytime
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
