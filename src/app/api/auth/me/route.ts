import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, TOKEN_COOKIE_CONFIG } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get(TOKEN_COOKIE_CONFIG.name)?.value;

    if (!token) {
      return unauthorizedResponse("No authentication token found");
    }

    // Verify token
    const payload = await verifyToken(token);
    if (!payload) {
      return unauthorizedResponse("Invalid or expired token");
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return unauthorizedResponse("User not found");
    }

    if (!user.isActive) {
      return unauthorizedResponse("Account is deactivated");
    }

    return successResponse(user, "User retrieved successfully");
  } catch (error) {
    console.error("Get current user error:", error);
    return serverErrorResponse("Failed to get user information");
  }
}
