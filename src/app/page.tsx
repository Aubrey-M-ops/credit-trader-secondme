import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginButton from "@/components/LoginButton";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo / 标题 */}
        <div className="mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Credit Trader</h1>
          <p className="mt-2 text-sm text-gray-500">
            基于 SecondMe 的个人信息与智能对话平台
          </p>
        </div>

        {/* 功能介绍 */}
        <div className="mb-8 space-y-3 text-left">
          <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">个人信息</p>
              <p className="text-xs text-gray-500">查看你的 SecondMe 资料和兴趣标签</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">智能对话</p>
              <p className="text-xs text-gray-500">与你的 SecondMe 进行实时对话</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">笔记记录</p>
              <p className="text-xs text-gray-500">为你的 SecondMe 添加新的记忆</p>
            </div>
          </div>
        </div>

        {/* 登录按钮 */}
        <LoginButton />
      </div>
    </div>
  );
}
