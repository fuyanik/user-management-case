import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, TOKEN_COOKIE_CONFIG } from "@/lib/auth";
import { 
  successResponse, 
  unauthorizedResponse, 
  notFoundResponse,
  serverErrorResponse 
} from "@/lib/utils";

// GET /api/users/[userid] - Get single user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userid: string }> }
) {
  try {
    // Verify authentication
    const token = request.cookies.get(TOKEN_COOKIE_CONFIG.name)?.value;
    if (!token) {
      return unauthorizedResponse("Authentication required");
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return unauthorizedResponse("Invalid or expired token");
    }

    const { userid } = await params;

    // Get user by ID
    const user = await prisma.user.findUnique({
      where: { id: userid },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        age: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return notFoundResponse("User not found");
    }

    return successResponse(user, "User retrieved successfully");
  } catch (error) {
    console.error("Get user error:", error);
    return serverErrorResponse("Failed to retrieve user");
  }
}
