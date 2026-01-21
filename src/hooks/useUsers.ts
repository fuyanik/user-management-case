"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User, ApiResponse, PaginatedResponse, ExcelUploadResponse } from "@/types";

interface FetchUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  minAge?: number;
  maxAge?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Fetch users with pagination
async function fetchUsers(params: FetchUsersParams): Promise<PaginatedResponse<Omit<User, "password">>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.minAge) searchParams.set("minAge", params.minAge.toString());
  if (params.maxAge) searchParams.set("maxAge", params.maxAge.toString());
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  const response = await fetch(`/api/users?${searchParams.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch users");
  }

  return {
    data: data.data.users,
    pagination: data.data.pagination,
  };
}

// Fetch single user
async function fetchUser(userId: string): Promise<Omit<User, "password">> {
  const response = await fetch(`/api/users/${userId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch user");
  }

  return data.data;
}

// Upload Excel file
async function uploadExcel(file: File): Promise<ExcelUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/users/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Upload failed") as Error & { 
      errors?: unknown;
      status?: number;
    };
    error.errors = data.errors;
    error.status = response.status;
    throw error;
  }

  return data;
}

// Create user
async function createUser(userData: {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  password: string;
}): Promise<ApiResponse<User>> {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Failed to create user") as Error & { 
      errors?: unknown;
    };
    error.errors = data.errors;
    throw error;
  }

  return data;
}

export function useUsers(params: FetchUsersParams = {}) {
  const queryClient = useQueryClient();

  // Users query
  const usersQuery = useQuery({
    queryKey: ["users", params],
    queryFn: () => fetchUsers(params),
    staleTime: 30 * 1000, // 30 seconds
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: uploadExcel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return {
    users: usersQuery.data?.data || [],
    pagination: usersQuery.data?.pagination,
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    refetch: usersQuery.refetch,

    uploadExcel: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error as Error & { errors?: unknown } | null,
    resetUploadError: uploadMutation.reset,

    createUser: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error as Error & { errors?: unknown } | null,
  };
}

export function useUser(userId: string) {
  const userQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    error: userQuery.error,
    refetch: userQuery.refetch,
  };
}
