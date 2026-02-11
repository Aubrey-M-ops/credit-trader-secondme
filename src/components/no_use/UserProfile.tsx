"use client";

import { useEffect, useState } from "react";

interface UserInfo {
  email?: string;
  name?: string;
  avatarUrl?: string;
  route?: string;
}

interface Shade {
  name?: string;
  description?: string;
  [key: string]: unknown;
}

export default function UserProfile() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [shades, setShades] = useState<Shade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [infoRes, shadesRes] = await Promise.all([
          fetch("/api/secondme/user/info"),
          fetch("/api/user/shades"),
        ]);

        if (infoRes.ok) {
          const infoResult = await infoRes.json();
          if (infoResult.code === 0) {
            setUserInfo(infoResult.data);
          }
        }

        if (shadesRes.ok) {
          const shadesResult = await shadesRes.json();
          if (shadesResult.code === 0) {
            setShades(shadesResult.data?.shades ?? []);
          }
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500">
        无法获取用户信息
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 用户基本信息 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {userInfo.avatarUrl ? (
            <img
              src={userInfo.avatarUrl}
              alt={userInfo.name ?? "头像"}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-indigo-100"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
              {(userInfo.name ?? userInfo.email ?? "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {userInfo.name ?? "未设置昵称"}
            </h2>
            {userInfo.email && (
              <p className="text-sm text-gray-500">{userInfo.email}</p>
            )}
            {userInfo.route && (
              <p className="text-xs text-gray-400">ID: {userInfo.route}</p>
            )}
          </div>
        </div>
      </div>

      {/* 兴趣标签 */}
      {shades.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-medium text-gray-700">兴趣标签</h3>
          <div className="flex flex-wrap gap-2">
            {shades.map((shade, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700"
                title={shade.description}
              >
                {shade.name ?? JSON.stringify(shade)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
