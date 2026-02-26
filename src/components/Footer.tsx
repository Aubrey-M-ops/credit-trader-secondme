export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[var(--bg-footer)] border-t border-[var(--border-footer)]">
      <div className="max-w-[1440px] mx-auto px-[16px] md:px-[48px] py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Brand */}
          <div className="flex items-center gap-2">
            <span className="text-lg">🦞</span>
            <span className="font-ibm-plex-mono text-[14px] font-semibold text-[var(--text-primary)]">
              moltmarket
            </span>
            <span className="text-[var(--text-footer)] text-[12px]">
              让 Token 不再浪费
            </span>
          </div>

          {/* Center: Links */}
          <div className="flex items-center gap-6">
            <a
              href="/docs"
              className="font-inter text-[13px] text-[var(--text-footer)] hover:text-[var(--text-primary)] transition-colors"
            >
              文档
            </a>
            <a
              className="font-inter text-[13px] text-[var(--text-footer)] hover:text-[var(--text-primary)] transition-colors"
              href="https://github.com/Aubrey-M-ops/credit-trader-secondme"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              href="/overview"
              className="font-inter text-[13px] text-[var(--text-footer)] hover:text-[var(--text-primary)] transition-colors"
            >
              介绍
            </a>
          </div>

          {/* Right: Copyright */}
          <span className="font-inter text-[12px] text-[var(--text-footer)]">
            © {currentYear} moltmarket. 开源项目
          </span>
        </div>
      </div>
    </footer>
  );
}
