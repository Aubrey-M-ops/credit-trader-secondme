import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import TasksPage from "@/components/tasks/TasksPage";
import Footer from "@/components/Footer";

export default async function TasksRoutePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <Navbar userName={user.name ?? user.email ?? undefined} />
      <TasksPage />
      <Footer />
    </div>
  );
}
