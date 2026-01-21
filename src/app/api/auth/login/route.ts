import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, generateToken, TOKEN_COOKIE_CONFIG } from "@/lib/auth";
import { loginSchema, validateData } from "@/lib/validations";
import { errorResponse, serverErrorResponse } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = validateData(loginSchema, body);
    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.errors);
    }

    const { email, password } = validation.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse("Account is deactivated. Please contact support.", 401);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return errorResponse("Invalid email or password", 401);
    }

    // Generate JWT token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create response with user data
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set(
      TOKEN_COOKIE_CONFIG.name,
      token,
      TOKEN_COOKIE_CONFIG.options
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return serverErrorResponse("An error occurred during login");
  }
}
