import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, TOKEN_COOKIE_CONFIG, hashPassword } from "@/lib/auth";
import { parseExcelFile, findDuplicateEmails } from "@/lib/excel";
import { 
  errorResponse, 
  unauthorizedResponse, 
  serverErrorResponse 
} from "@/lib/utils";
import type { ValidationErrorResponse } from "@/types";

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

    // Only admins can upload users
    if (payload.role !== "ADMIN") {
      return errorResponse("Only administrators can upload users", 403);
    }

    // Get the file from form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return errorResponse("No file uploaded", 400);
    }

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      return errorResponse("Invalid file type. Please upload an Excel file (.xlsx or .xls)", 400);
    }

    // Parse Excel file
    const buffer = await file.arrayBuffer();
    const parseResult = parseExcelFile(buffer);

    if (!parseResult.success) {
      return errorResponse(
        parseResult.message || "Failed to parse Excel file",
        400,
        parseResult.errors
      );
    }

    const usersData = parseResult.data!;

    if (usersData.length === 0) {
      return errorResponse("Excel file contains no user data", 400);
    }

    // Check for duplicates within the file
    const inFileDuplicates = findDuplicateEmails(usersData);
    if (inFileDuplicates.length > 0) {
      return errorResponse(
        "Duplicate emails found within the Excel file",
        400,
        inFileDuplicates
      );
    }

    // Check for existing users in database
    const emails = usersData.map((u) => u.email.toLowerCase());
    const existingUsers = await prisma.user.findMany({
      where: {
        email: { in: emails },
      },
      select: { email: true },
    });

    if (existingUsers.length > 0) {
      const existingEmails = existingUsers.map((u) => u.email);
      const errors: ValidationErrorResponse[] = [];
      
      usersData.forEach((user, index) => {
        if (existingEmails.includes(user.email.toLowerCase())) {
          errors.push({
            row: index + 2,
            field: "email",
            message: `Email "${user.email}" already exists in the database`,
          });
        }
      });

      return errorResponse(
        "Some users already exist in the database",
        409,
        errors
      );
    }

    // Prepare users for insertion with hashed passwords
    const usersToCreate = await Promise.all(
      usersData.map(async (user) => {
        const hashedPassword = await hashPassword(user.password);

        return {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email.toLowerCase(),
          age: user.age,
          password: hashedPassword,
        };
      })
    );

    // Use transaction to ensure all-or-nothing insert
    // If any error occurs, none of the users will be added
    const createdUsers = await prisma.$transaction(async (tx) => {
      const results = [];

      for (const userData of usersToCreate) {
        // Double-check for duplicates within transaction
        // This handles race conditions where another request might have inserted the same email
        const existing = await tx.user.findUnique({
          where: { email: userData.email },
        });

        if (existing) {
          throw new Error(`Email ${userData.email} was inserted by another process`);
        }

        const user = await tx.user.create({
          data: userData,
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

        results.push(user);
      }

      return results;
    });

    return Response.json(
      {
        success: true,
        message: `Successfully imported ${createdUsers.length} users`,
        data: {
          imported: createdUsers.length,
          users: createdUsers,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Excel upload error:", error);
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("was inserted by another process")) {
        return errorResponse(error.message, 409);
      }
      
      if (error.message.includes("Unique constraint")) {
        return errorResponse(
          "A user with one of the provided emails already exists",
          409
        );
      }
    }

    return serverErrorResponse("Failed to process Excel file");
  }
}
