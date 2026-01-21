"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUsers";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Select } from "@/components/ui/Select";

type SortOption = "newest" | "oldest" | "age_asc" | "age_desc" | "name_asc" | "name_desc";

const sortOptions = [
  { 
    value: "newest", 
    label: "Newest First",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
  { 
    value: "oldest", 
    label: "Oldest First",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
  { 
    value: "age_asc", 
    label: "Age: Low to High",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
  },
  { 
    value: "age_desc", 
    label: "Age: High to Low",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" /></svg>
  },
  { 
    value: "name_asc", 
    label: "Name: A to Z",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
  },
  { 
    value: "name_desc", 
    label: "Name: Z to A",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" /></svg>
  },
];

function getSortParams(sort: SortOption): { sortBy: string; sortOrder: "asc" | "desc" } {
  switch (sort) {
    case "newest":
      return { sortBy: "createdAt", sortOrder: "desc" };
    case "oldest":
      return { sortBy: "createdAt", sortOrder: "asc" };
    case "age_asc":
      return { sortBy: "age", sortOrder: "asc" };
    case "age_desc":
      return { sortBy: "age", sortOrder: "desc" };
    case "name_asc":
      return { sortBy: "firstName", sortOrder: "asc" };
    case "name_desc":
      return { sortBy: "firstName", sortOrder: "desc" };
    default:
      return { sortBy: "createdAt", sortOrder: "desc" };
  }
}

const limitOptions = [
  { value: "10", label: "10" },
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
];

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isAuthLoading, logout, isLoggingOut } = useAuth();

  // URL'den parametreleri al
  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentSearch = searchParams.get("search") || "";
  const currentMinAge = searchParams.get("minAge") || "";
  const currentMaxAge = searchParams.get("maxAge") || "";
  const currentSort = (searchParams.get("sort") as SortOption) || "newest";
  const currentLimit = parseInt(searchParams.get("limit") || "10");

  // Local state for inputs
  const [search, setSearch] = useState(currentSearch);
  const [minAge, setMinAge] = useState(currentMinAge);
  const [maxAge, setMaxAge] = useState(currentMaxAge);

  const { sortBy, sortOrder } = getSortParams(currentSort);

  const { users, pagination, isLoading } = useUsers({
    page: currentPage,
    limit: currentLimit,
    search: currentSearch,
    minAge: currentMinAge ? parseInt(currentMinAge) : undefined,
    maxAge: currentMaxAge ? parseInt(currentMaxAge) : undefined,
    sortBy,
    sortOrder,
  });

  // URL'i güncelle
  const updateURL = (params: Record<string, string | number | undefined>) => {
    const newParams = new URLSearchParams();
    
    const allParams = {
      page: currentPage,
      search: currentSearch,
      minAge: currentMinAge,
      maxAge: currentMaxAge,
      sort: currentSort,
      limit: currentLimit,
      ...params,
    };

    Object.entries(allParams).forEach(([key, value]) => {
      if (value && value !== "" && value !== 1 && value !== "newest" && value !== 10) {
        newParams.set(key, String(value));
      }
    });

    const queryString = newParams.toString();
    router.push(`/dashboard${queryString ? `?${queryString}` : ""}`);
  };

  // Limit değiştir
  const handleLimitChange = (limit: string) => {
    updateURL({ limit: parseInt(limit), page: 1 });
  };

  // Filter uygula
  const applyFilters = () => {
    updateURL({ 
      page: 1, 
      search, 
      minAge: minAge || undefined, 
      maxAge: maxAge || undefined 
    });
  };

  // Filtreleri temizle
  const clearFilters = () => {
    setSearch("");
    setMinAge("");
    setMaxAge("");
    router.push("/dashboard");
  };

  // Sayfa değiştir
  const changePage = (page: number) => {
    updateURL({ page });
  };

  // Sıralama değiştir
  const handleSortChange = (sort: SortOption) => {
    updateURL({ sort, page: 1 });
  };

  // Sync local state with URL params
  useEffect(() => {
    setSearch(currentSearch);
    setMinAge(currentMinAge);
    setMaxAge(currentMaxAge);
  }, [currentSearch, currentMinAge, currentMaxAge]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#86868b]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-[#d2d2d7] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1d1d1f] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-[#1d1d1f]">Users</h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-[#86868b]">
                {user?.firstName} {user?.lastName}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => logout()}
                isLoading={isLoggingOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f]">All Users</h2>
            {pagination && (
              <p className="text-sm text-[#86868b] mt-1">{pagination.total} users total</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/add">
              <Button>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add User
              </Button>
            </Link>
            <Link href="/dashboard/addMany">
              <Button variant="secondary">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import Excel
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  label="Search"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                />
              </div>
              <div className="w-28">
                <Input
                  label="Min Age"
                  type="number"
                  placeholder="Min"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                />
              </div>
              <div className="w-28">
                <Input
                  label="Max Age"
                  type="number"
                  placeholder="Max"
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                />
              </div>
              <Select
                label="Sort By"
                value={currentSort}
                onChange={(value) => handleSortChange(value as SortOption)}
                options={sortOptions}
                className="w-48"
              />
              <Button onClick={applyFilters}>
                Apply
              </Button>
              {(currentSearch || currentMinAge || currentMaxAge) && (
                <Button variant="ghost" onClick={clearFilters}>
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-3 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
                  <p className="text-[#86868b]">Loading users...</p>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-[#f5f5f7] rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-[#1d1d1f] mb-1">No users found</h3>
                <p className="text-[#86868b]">Try adjusting your filters or add new users.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f] text-sm font-medium">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <span className="font-medium">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-[#86868b]">{user.email}</span>
                      </TableCell>
                      <TableCell>{user.age}</TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "success" : "danger"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-[#86868b] text-xs">
                          {formatDateTime(user.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/${user.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {pagination && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#e8e8ed]">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-[#86868b]">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#86868b]">Per page:</span>
                    <div className="flex items-center bg-[#f5f5f7] rounded-lg p-0.5">
                      {limitOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleLimitChange(option.value)}
                          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                            currentLimit === parseInt(option.value)
                              ? "bg-white text-[#1d1d1f] shadow-sm"
                              : "text-[#86868b] hover:text-[#1d1d1f]"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {pagination.totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changePage(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-[#86868b] px-2">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changePage(currentPage + 1)}
                      disabled={currentPage >= pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#86868b]">Loading dashboard...</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
