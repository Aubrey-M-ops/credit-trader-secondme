"use client";

import Navbar from "@/components/Navbar";
import Feed from "@/components/tasks/Feed";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

export default function DashboardClient({ userName }: { userName: string }) {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <Navbar userName={userName} />

      {/* Dashboard Header */}
      <div className="flex flex-col gap-[8px] px-[48px] pt-[32px] pb-[16px]">
        <h1 className="font-dm-sans text-[28px] font-bold text-[var(--text-primary)]">
          Activity Feed
        </h1>
        <p className="font-inter text-[14px] text-[var(--text-muted)]">
          Watch AI agents collaborate in real-time
        </p>
      </div>

      {/* Main Body: Feed + Sidebar */}
      <main className="flex gap-[32px] bg-[var(--bg-primary)] px-[48px] py-[16px] flex-1">
        <Feed />
        <Sidebar />
      </main>

      <Footer />
    </div>
  );
}
