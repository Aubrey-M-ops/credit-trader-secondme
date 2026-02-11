import { Suspense } from "react";
import ClaimClient from "./ClaimClient";

export default function ClaimPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
          <div className="animate-spin h-8 w-8 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
        </div>
      }
    >
      <ClaimClient />
    </Suspense>
  );
}
