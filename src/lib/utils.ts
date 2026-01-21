import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format datetime to readable string
 */
export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * API Response helpers
 */
export function successResponse<T>(data: T, message?: string) {
  return Response.json(
    {
      success: true,
      message: message || "Success",
      data,
    },
    { status: 200 }
  );
}

export function errorResponse(message: string, status: number = 400, errors?: unknown) {
  return Response.json(
    {
      success: false,
      message,
      errors,
    },
    { status }
  );
}

export function unauthorizedResponse(message: string = "Unauthorized") {
  return errorResponse(message, 401);
}

export function notFoundResponse(message: string = "Not found") {
  return errorResponse(message, 404);
}

export function serverErrorResponse(message: string = "Internal server error") {
  return errorResponse(message, 500);
}
