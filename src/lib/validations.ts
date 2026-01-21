import { z } from "zod";

// ============================================
// Auth Validations
// ============================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(4, "Password must be at least 4 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ============================================
// User Validations
// ============================================

export const createUserSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be less than 100 characters")
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "First name can only contain letters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be less than 100 characters")
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Last name can only contain letters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters"),
  age: z
    .number()
    .int("Age must be an integer")
    .min(1, "Age must be at least 1")
    .max(150, "Age must be less than 150"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// Excel row validation - password is required per case requirements
export const excelRowSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be less than 100 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be less than 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters"),
  age: z
    .number()
    .int("Age must be an integer")
    .min(1, "Age must be at least 1")
    .max(150, "Age must be less than 150"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
});

export type ExcelRowInput = z.infer<typeof excelRowSchema>;

// ============================================
// Validation Helpers
// ============================================

export interface ValidationError {
  row?: number;
  field: string;
  message: string;
}

/**
 * Validate data against a schema and return formatted errors
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  rowNumber?: number
): { success: true; data: T } | { success: false; errors: ValidationError[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: ValidationError[] = result.error.errors.map((err) => ({
    row: rowNumber,
    field: err.path.join("."),
    message: err.message,
  }));

  return { success: false, errors };
}

/**
 * Validate multiple rows and collect all errors
 */
export function validateMultipleRows<T>(
  schema: z.ZodSchema<T>,
  rows: unknown[]
): { success: true; data: T[] } | { success: false; errors: ValidationError[] } {
  const validatedData: T[] = [];
  const allErrors: ValidationError[] = [];

  rows.forEach((row, index) => {
    const result = validateData(schema, row, index + 2); // +2 because row 1 is header
    if (result.success) {
      validatedData.push(result.data);
    } else {
      allErrors.push(...result.errors);
    }
  });

  if (allErrors.length > 0) {
    return { success: false, errors: allErrors };
  }

  return { success: true, data: validatedData };
}
