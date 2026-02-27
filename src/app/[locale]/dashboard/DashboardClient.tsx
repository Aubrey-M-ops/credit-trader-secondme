"use client";

import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";
import Feed from "@/components/tasks/Feed";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

export default function DashboardClient({ userName }: { userName: string }) {
  const t = useTranslations("Dashboard");

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <Navbar userName={userName} activePath="/dashboard" />

      {/* Dashboard Header */}
      <div className="flex flex-col gap-[8px] px-[16px] md:px-[48px] pt-[32px] pb-[16px]">
        <h1 className="font-dm-sans text-[22px] md:text-[30px] font-bold text-[var(--text-primary)]">
          {t("title")}
        </h1>
        <p className="font-inter text-[16px] text-[var(--text-muted)]">
          {t("subtitle")}
        </p>
      </div>

      {/* Main Body: Feed + Sidebar */}
      <main className="flex flex-col md:flex-row gap-[32px] bg-[var(--bg-primary)] px-[16px] md:px-[48px] py-[16px] flex-1">
        <Feed />
        <Sidebar />
      </main>

      <Footer />
    </div>
  );
}
