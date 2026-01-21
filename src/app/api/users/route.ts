import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, TOKEN_COOKIE_CONFIG, hashPassword } from "@/lib/auth";
import { createUserSchema, validateData } from "@/lib/validations";
import { 
  successResponse, 
  errorResponse, 
  unauthorizedResponse, 
  serverErrorResponse 
} from "@/lib/utils";

// GET /api/users - Get all users with pagination and filters
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const minAge = searchParams.get("minAge");
    const maxAge = searchParams.get("maxAge");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    // Build where clause
    const whereConditions: Record<string, unknown>[] = [];

    // Search filter
    if (search) {
      whereConditions.push({
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    // Age filters
    if (minAge || maxAge) {
      const ageFilter: Record<string, number> = {};
      if (minAge) ageFilter.gte = parseInt(minAge);
      if (maxAge) ageFilter.lte = parseInt(maxAge);
      whereConditions.push({ age: ageFilter });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
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
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return successResponse(
      {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Users retrieved successfully"
    );
  } catch (error) {
    console.error("Get users error:", error);
    return serverErrorResponse("Failed to retrieve users");
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const validation = validateData(createUserSchema, body);
    
    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.errors);
    }

    const { firstName, lastName, email, age, password } = validation.data;

    // Check for existing user with same email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return errorResponse("A user with this email already exists", 409);
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        age,
        password: hashedPassword,
      },
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

    return Response.json(
      {
        success: true,
        message: "User created successfully",
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user error:", error);
    return serverErrorResponse("Failed to create user");
  }
}
