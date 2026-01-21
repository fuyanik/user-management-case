"use client";

import { use } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUsers";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";

interface UserDetailPageProps {
  params: Promise<{ userid: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const { userid } = use(params);
  const { user, isLoading, error } = useUser(userid);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#86868b]">Loading user...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#f5f5f7]">
        <header className="bg-white/80 backdrop-blur-xl border-b border-[#d2d2d7] sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link href="/dashboard" className="text-[#0071e3] hover:text-[#0077ed] transition-colors mr-4 flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Link>
              <h1 className="text-xl font-semibold text-[#1d1d1f]">User Not Found</h1>
            </div>
          </div>
        </header>
        <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-[#ff3b30]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#ff3b30]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[#1d1d1f] mb-2">User Not Found</h2>
              <p className="text-[#86868b] mb-6">
                The user you&apos;re looking for doesn&apos;t exist.
              </p>
              <Link href="/dashboard">
                <Button>Back to Users</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-[#d2d2d7] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard" className="text-[#0071e3] hover:text-[#0077ed] transition-colors mr-4 flex items-center gap-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <h1 className="text-xl font-semibold text-[#1d1d1f]">User Details</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-6">
            {/* User Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-[#e8e8ed]">
              <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center text-2xl font-semibold text-[#1d1d1f]">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[#1d1d1f]">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-[#86868b]">{user.email}</p>
              </div>
            </div>

            {/* User Info */}
            <div className="py-6 space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-[#86868b]">First Name</span>
                <span className="text-[#1d1d1f] font-medium">{user.firstName}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[#86868b]">Last Name</span>
                <span className="text-[#1d1d1f] font-medium">{user.lastName}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[#86868b]">Email</span>
                <span className="text-[#1d1d1f] font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[#86868b]">Age</span>
                <span className="text-[#1d1d1f] font-medium">{user.age} years</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[#86868b]">Role</span>
                <Badge variant={user.role === "ADMIN" ? "info" : "default"}>
                  {user.role}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[#86868b]">Status</span>
                <Badge variant={user.isActive ? "success" : "danger"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            {/* Timestamps */}
            <div className="pt-6 border-t border-[#e8e8ed] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#86868b]">Created</span>
                <span className="text-sm text-[#1d1d1f]">{formatDateTime(user.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#86868b]">Updated</span>
                <span className="text-sm text-[#1d1d1f]">{formatDateTime(user.updatedAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#86868b]">User ID</span>
                <code className="text-xs text-[#86868b] bg-[#f5f5f7] px-2 py-1 rounded-lg">{user.id}</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
