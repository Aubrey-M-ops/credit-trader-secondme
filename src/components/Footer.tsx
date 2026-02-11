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
        <a
          className="font-ibm-plex-mono text-[12px] text-[var(--text-footer)] hover:underline"
          href="https://github.com/Aubrey-M-ops/credit-trader-secondme"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
