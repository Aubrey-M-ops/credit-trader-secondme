import { PrismaClient } from "../src/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomBytes } from "crypto";
import * as bcrypt from "bcrypt";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function makeApiKey() {
  const full = `ct_${randomBytes(32).toString("base64url")}`;
  return { full, prefix: full.slice(0, 11) };
}

function makeClaimCode() {
  return randomBytes(4).toString("hex").toUpperCase().slice(0, 8);
}

function makeVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function main() {
  console.log("🌱 Seeding database...");

  // ── Users ────────────────────────────────────────────────────────────────
  const [alice, bob, carol] = await Promise.all([
    prisma.user.create({
      data: {
        supabaseUserId: "test-supabase-uid-alice-0001",
        email: "alice@example.com",
        name: "Alice",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
        balance: 850,
        totalEarned: 1200,
        totalSpent: 350,
        completedTasks: 12,
      },
    }),
    prisma.user.create({
      data: {
        supabaseUserId: "test-supabase-uid-bob-0002",
        email: "bob@example.com",
        name: "Bob",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
        balance: 420,
        totalEarned: 600,
        totalSpent: 180,
        completedTasks: 5,
      },
    }),
    prisma.user.create({
      data: {
        supabaseUserId: "test-supabase-uid-carol-0003",
        email: "carol@example.com",
        name: "Carol",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=carol",
        balance: 100,
        totalEarned: 0,
        totalSpent: 0,
        completedTasks: 0,
      },
    }),
  ]);
  console.log("✅ Users created:", alice.name, bob.name, carol.name);

  // ── Agents ───────────────────────────────────────────────────────────────
  async function createAgent(
    name: string,
    userId: string | null,
    status: string,
    overrides: Record<string, unknown> = {}
  ) {
    const { full, prefix } = makeApiKey();
    const hash = await bcrypt.hash(full, 10);
    return prisma.agent.create({
      data: {
        name,
        apiKey: prefix,
        apiKeyHash: hash,
        claimCode: makeClaimCode(),
        verificationCode: makeVerificationCode(),
        userId,
        status,
        claimedAt: userId ? new Date() : null,
        credits: 100,
        ...overrides,
      },
    });
  }

  const [aliceAgent, aliceAgent2, bobAgent, unclaimedA, unclaimedB] =
    await Promise.all([
      createAgent("Alice-Coder", alice.id, "active", {
        credits: 340,
        totalEarned: 500,
        totalSpent: 160,
        tasksPublished: 8,
        tasksCompleted: 10,
        tokensSaved: 24000,
        tokensContributed: 18000,
        reputation: 42,
      }),
      createAgent("Alice-Researcher", alice.id, "active", {
        credits: 180,
        totalEarned: 200,
        totalSpent: 20,
        tasksPublished: 3,
        tasksCompleted: 2,
        tokensSaved: 8000,
        tokensContributed: 5000,
        reputation: 18,
      }),
      createAgent("Bob-Analyst", bob.id, "active", {
        credits: 220,
        totalEarned: 300,
        totalSpent: 80,
        tasksPublished: 5,
        tasksCompleted: 5,
        tokensSaved: 12000,
        tokensContributed: 9000,
        reputation: 25,
      }),
      createAgent("Wanderer-7", null, "unclaimed", {}),
      createAgent("Scout-Alpha", null, "unclaimed", {}),
    ]);
  console.log("✅ Agents created (3 claimed, 2 unclaimed)");

  // ── Tasks ────────────────────────────────────────────────────────────────
  const tasksData = [
    // completed
    {
      title: "Summarize quarterly earnings report",
      description: "Parse the Q3 PDF and produce a 3-bullet executive summary.",
      estimatedTokens: 4000,
      estimatedCredits: 40,
      priority: "high",
      status: "completed",
      publisherAgentId: aliceAgent.id,
      workerAgentId: bobAgent.id,
      result: "Revenue up 12 %, operating margin 18 %, headcount stable.",
      actualTokens: 3800,
      rating: 5,
      acceptedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      title: "Translate README to Chinese",
      description: "Translate the project README.md from English to Simplified Chinese.",
      estimatedTokens: 2000,
      estimatedCredits: 20,
      priority: "medium",
      status: "completed",
      publisherAgentId: bobAgent.id,
      workerAgentId: aliceAgent.id,
      result: "Translation complete. 98 % confidence score.",
      actualTokens: 1950,
      rating: 4,
      acceptedAt: new Date(Date.now() - 1000 * 60 * 60 * 10),
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 9),
    },
    // executing
    {
      title: "Generate unit tests for auth module",
      description: "Write Jest tests covering all branches in src/lib/auth.ts.",
      estimatedTokens: 6000,
      estimatedCredits: 60,
      priority: "high",
      status: "executing",
      publisherAgentId: aliceAgent2.id,
      workerAgentId: bobAgent.id,
      acceptedAt: new Date(Date.now() - 1000 * 60 * 30),
    },
    // accepted
    {
      title: "Review PR #42 for security issues",
      description: "Check the OAuth callback changes for CSRF or token-leak vulnerabilities.",
      estimatedTokens: 3000,
      estimatedCredits: 30,
      priority: "high",
      status: "accepted",
      publisherAgentId: aliceAgent.id,
      workerAgentId: aliceAgent2.id,
      acceptedAt: new Date(Date.now() - 1000 * 60 * 10),
    },
    // pending
    {
      title: "Create onboarding email copy",
      description: "Write 3 onboarding email templates (welcome, day-3, day-7) in a friendly tone.",
      estimatedTokens: 2500,
      estimatedCredits: 25,
      priority: "medium",
      status: "pending",
      publisherAgentId: bobAgent.id,
    },
    {
      title: "Analyze competitor pricing page",
      description: "Screenshot and summarize pricing tiers from top 5 competitors.",
      estimatedTokens: 5000,
      estimatedCredits: 50,
      priority: "low",
      status: "pending",
      publisherAgentId: aliceAgent.id,
    },
    {
      title: "Debug slow API response on /api/stats",
      description: "Profile the endpoint and identify the N+1 query causing latency.",
      estimatedTokens: 4500,
      estimatedCredits: 45,
      priority: "high",
      status: "pending",
      publisherAgentId: aliceAgent2.id,
    },
  ];

  const tasks = await Promise.all(
    tasksData.map((t) => prisma.task.create({ data: t as Parameters<typeof prisma.task.create>[0]["data"] }))
  );
  console.log(`✅ Tasks created: ${tasks.length} (2 completed, 1 executing, 1 accepted, 3 pending)`);

  // ── Activity Feed ─────────────────────────────────────────────────────────
  const [completedTask1, completedTask2] = tasks;

  await Promise.all([
    prisma.activityFeed.create({
      data: {
        eventType: "task_completed",
        agentId: bobAgent.id,
        taskId: completedTask1.id,
        title: "Bob-Analyst completed a task",
        description: "Summarized quarterly earnings report for Alice-Coder.",
        metadata: { creditsEarned: 40, tokensUsed: 3800 },
      },
    }),
    prisma.activityFeed.create({
      data: {
        eventType: "task_completed",
        agentId: aliceAgent.id,
        taskId: completedTask2.id,
        title: "Alice-Coder completed a task",
        description: "Translated README to Chinese for Bob-Analyst.",
        metadata: { creditsEarned: 20, tokensUsed: 1950 },
      },
    }),
    prisma.activityFeed.create({
      data: {
        eventType: "agent_claimed",
        agentId: aliceAgent.id,
        title: "Alice-Coder was claimed",
        description: "Agent Alice-Coder has been successfully claimed and linked to your account.",
        metadata: { userId: alice.id },
      },
    }),
    prisma.activityFeed.create({
      data: {
        eventType: "task_published",
        agentId: aliceAgent.id,
        taskId: tasks[5].id,
        title: "Alice-Coder published a new task",
        description: "Analyze competitor pricing page",
        metadata: { estimatedCredits: 50 },
      },
    }),
  ]);
  console.log("✅ Activity feed created");

  console.log("\n🎉 Seed complete!");
  console.log(`   Users:   3  (alice / bob / carol)`);
  console.log(`   Agents:  5  (3 active, 2 unclaimed)`);
  console.log(`   Tasks:   ${tasks.length}  (2 completed, 1 executing, 1 accepted, 3 pending)`);
  console.log(`   Feed:    4 entries`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
