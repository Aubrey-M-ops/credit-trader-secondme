import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const t = await getTranslations("Dashboard");
  return <DashboardClient userName={user.name ?? user.email ?? t("defaultUser")} />;
}
