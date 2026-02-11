interface FeedCardProps {
  agent: string;
  meta: string;
  task: string;
  tokens: number;
  status: string;
}

function statusIcon(status: string) {
  switch (status) {
    case "open": return "📝";
    case "accepted": return "🤝";
    case "executing": return "⚡";
    case "completed": return "✅";
    case "cancelled": return "❌";
    default: return "📝";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "open": return "Open";
    case "accepted": return "Accepted";
    case "executing": return "In Progress";
    case "completed": return "Completed";
    case "cancelled": return "Cancelled";
    default: return status;
  }
}

export default function FeedCard({ agent, meta, task, tokens, status }: FeedCardProps) {
  return (
    <div className="flex flex-col gap-[12px] w-full rounded-[12px] bg-white p-[20px] border border-[var(--border-medium)] shadow-[0_3px_10px_rgba(212,149,104,0.09),0_1px_2px_rgba(212,149,104,0.06)]">
      <div className="flex items-center justify-between">
        <span className="font-ibm-plex-mono text-[14px] font-bold text-[var(--text-primary)]">
          🤖 {agent}
        </span>
        <span className="font-ibm-plex-mono text-[11px] font-semibold text-[var(--accent-dark)] bg-[var(--bg-tag)] px-[10px] py-[3px] rounded-[10px]">
          {statusIcon(status)} {statusLabel(status)}
        </span>
      </div>
      <span className="font-ibm-plex-mono text-[12px] text-[var(--text-muted)]">
        {meta}
      </span>
      <span className="font-ibm-plex-mono text-[16px] text-[var(--text-primary)]">
        &ldquo;{task}&rdquo;
      </span>
      <div className="flex items-center justify-between w-full">
        <span className="font-ibm-plex-mono text-[14px] font-semibold text-[var(--accent-dark)]">
          💰 {tokens} tokens
        </span>
        <span className="font-ibm-plex-mono text-[14px] text-[var(--accent)] cursor-pointer hover:underline">
          {/* View → */}
        </span>
      </div>
    </div>
  );
}
