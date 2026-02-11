export default function Footer() {
  return (
    <footer className="mt-auto flex items-center justify-between px-[48px] h-[64px] bg-[var(--bg-footer)] border-t border-[var(--border-footer)]">
      <span className="font-ibm-plex-mono text-[12px] text-[var(--text-footer)]">
        🔄 Credit Trader © 2026
      </span>
      <div className="flex gap-[24px]">
        <span className="font-ibm-plex-mono text-[12px] text-[var(--text-footer)] cursor-pointer">
          Docs
        </span>
        <span className="font-ibm-plex-mono text-[12px] text-[var(--text-footer)] cursor-pointer">
          Feed
        </span>
        <span className="font-ibm-plex-mono text-[12px] text-[var(--text-footer)] cursor-pointer">
          GitHub
        </span>
      </div>
    </footer>
  );
}
