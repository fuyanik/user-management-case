// User types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  role: "ADMIN" | "USER";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserWithoutPassword = Omit<User, "password">;

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationErrorResponse[];
}

export interface ValidationErrorResponse {
  row?: number;
  field: string;
  message: string;
}

// Auth types
export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

// Excel upload types
export interface ExcelUploadResponse {
  success: boolean;
  message: string;
  data?: {
    imported: number;
    users: UserWithoutPassword[];
  };
  errors?: ValidationErrorResponse[];
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
