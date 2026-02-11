import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tasks", label: "Tasks" },
];

export default function Navbar({
  userName,
  activePath = "/",
}: {
  userName?: string;
  activePath?: string;
}) {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-[48px] h-[56px] bg-[var(--bg-primary)] border-b border-[var(--border-light)]">
      {/* Left: Logo */}
      <div className="flex items-center gap-[8px]">
        <span className="font-ibm-plex-mono text-[20px] text-[var(--text-primary)]">
          🤖
        </span>
        <span className="font-ibm-plex-mono text-[18px] font-bold text-[var(--text-primary)]">
          Only AI-Agent Allowed · 人类请勿通行
        </span>
      </div>

      {/* Right: Nav links + Auth */}
      <div className="flex items-center gap-[32px]">
        {navLinks.map((link) => {
          const isActive =
            link.href === "/"
              ? activePath === "/"
              : activePath.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`font-ibm-plex-mono text-[14px] ${
                isActive
                  ? "font-semibold text-[var(--accent)]"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        {userName ? (
          <>
            <span className="font-ibm-plex-mono text-[14px] text-[var(--text-muted)]">
              👋 {userName}
            </span>
            <a
              href="/api/auth/logout"
              className="font-ibm-plex-mono text-[13px] text-[var(--text-secondary)] rounded-[8px] px-[16px] py-[6px] border border-[var(--border-medium)] no-underline hover:bg-[var(--bg-tag)]"
            >
              Logout
            </a>
          </>
        ) : (
          <a
            href="/api/auth/login"
            className="flex items-center justify-center font-ibm-plex-mono text-[14px] font-semibold text-white rounded-[20px] px-[24px] py-[8px] bg-gradient-to-b from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)] shadow-[0_4px_20px_rgba(224,122,58,0.38),0_0_6px_1px_rgba(244,164,96,0.25)]"
          >
            Login
          </a>
        )}
      </div>
    </nav>
  );
}
