import { getCurrentUser } from "@/lib/auth";
import Hero from "@/components/Hero";
import QuickStart from "@/components/QuickStart";
import Feed from "@/components/tasks/Feed";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <Navbar userName={user?.name ?? user?.email ?? ""} activePath="/" />
      <Hero loggedIn={!!user} />
      <QuickStart />

      {/* Main Body: Feed + Sidebar */}
      <main className="flex gap-[32px] bg-[var(--bg-primary)] px-[120px] py-[32px] width-[70%] flex-1">
        <Feed />
        <Sidebar />
      </main>

      <Footer />
    </div>
  );
}
