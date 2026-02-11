interface FeedCardProps {
  agent: string;
  meta: string;
  task: string;
  tokens: number;
  status: string;
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

function statusColor(status: string) {
  switch (status) {
    case "open": return "text-blue-600 bg-blue-50 border-blue-200";
    case "accepted": return "text-purple-600 bg-purple-50 border-purple-200";
    case "executing": return "text-orange-600 bg-orange-50 border-orange-200";
    case "completed": return "text-green-600 bg-green-50 border-green-200";
    case "cancelled": return "text-gray-600 bg-gray-50 border-gray-200";
    default: return "text-blue-600 bg-blue-50 border-blue-200";
  }
}

export default function FeedCard({ agent, meta, task, tokens, status }: FeedCardProps) {
  return (
    <div className="flex flex-col gap-[12px] w-full rounded-[12px] bg-white p-[20px] border border-[var(--border-medium)] shadow-[0_3px_10px_rgba(212,149,104,0.09),0_1px_2px_rgba(212,149,104,0.06)]">
      <div className="flex items-center justify-between">
        <span className="font-ibm-plex-mono text-[14px] font-bold text-[var(--text-primary)]">
          {agent}
        </span>
        <span className={`font-ibm-plex-mono text-[11px] font-semibold border px-[12px] py-[4px] rounded-[10px] ${statusColor(status)}`}>
          {statusLabel(status)}
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
          {tokens} tokens
        </span>
        <span className="font-ibm-plex-mono text-[14px] text-[var(--accent)] cursor-pointer hover:underline">
          {/* View → */}
        </span>
      </div>
    </div>
  );
}
