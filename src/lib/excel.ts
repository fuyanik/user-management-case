import * as XLSX from "xlsx";
import { excelRowSchema, validateMultipleRows, type ValidationError, type ExcelRowInput } from "./validations";

// Expected Excel column headers mapping
const COLUMN_MAPPING: Record<string, keyof ExcelRowInput> = {
  "firstname": "firstName",
  "first_name": "firstName",
  "first name": "firstName",
  "ad": "firstName",
  "lastname": "lastName",
  "last_name": "lastName",
  "last name": "lastName",
  "soyad": "lastName",
  "email": "email",
  "e-mail": "email",
  "eposta": "email",
  "e-posta": "email",
  "age": "age",
  "yaş": "age",
  "yas": "age",
  "password": "password",
  "şifre": "password",
  "sifre": "password",
};

export interface ExcelParseResult {
  success: boolean;
  data?: ExcelRowInput[];
  errors?: ValidationError[];
  message?: string;
}

/**
 * Normalize column header to match expected fields
 */
function normalizeHeader(header: string): keyof ExcelRowInput | null {
  const normalized = header.toLowerCase().trim();
  return COLUMN_MAPPING[normalized] || null;
}

/**
 * Parse Excel file buffer and extract user data
 */
export function parseExcelFile(buffer: ArrayBuffer): ExcelParseResult {
  try {
    // Read the workbook
    const workbook = XLSX.read(buffer, { type: "array" });

    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {
        success: false,
        message: "Excel file is empty or has no sheets",
      };
    }

    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      return {
        success: false,
        message: "Could not read worksheet",
      };
    }

    // Convert to JSON with header row
    const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: "",
      raw: true,
    });

    if (rawData.length === 0) {
      return {
        success: false,
        message: "Excel file has no data rows",
      };
    }

    // Get headers from first row keys and normalize them
    const firstRow = rawData[0];
    if (!firstRow) {
      return {
        success: false,
        message: "Could not read data from Excel file",
      };
    }

    const originalHeaders = Object.keys(firstRow);
    const headerMapping: Record<string, keyof ExcelRowInput | null> = {};

    // Map original headers to normalized field names
    for (const header of originalHeaders) {
      headerMapping[header] = normalizeHeader(header);
    }

    // Check if required fields are present
    const mappedFields = new Set(Object.values(headerMapping).filter(Boolean));
    const requiredFields: (keyof ExcelRowInput)[] = ["firstName", "lastName", "email", "age"];
    const missingFields = requiredFields.filter((field) => !mappedFields.has(field));

    if (missingFields.length > 0) {
      return {
        success: false,
        message: `Missing required columns: ${missingFields.join(", ")}. Expected columns: firstName, lastName, email, age (password is optional)`,
      };
    }

    // Transform data to expected format
    const transformedData = rawData.map((row) => {
      const transformed: Record<string, unknown> = {};

      for (const [originalHeader, value] of Object.entries(row)) {
        const mappedField = headerMapping[originalHeader];
        if (mappedField) {
          // Handle age conversion
          if (mappedField === "age") {
            const numValue = Number(value);
            transformed[mappedField] = isNaN(numValue) ? value : numValue;
          } else {
            // Trim strings
            transformed[mappedField] = typeof value === "string" ? value.trim() : value;
          }
        }
      }

      return transformed;
    });

    // Validate all rows
    const validationResult = validateMultipleRows(excelRowSchema, transformedData);

    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.errors,
        message: `Validation failed for ${validationResult.errors.length} field(s)`,
      };
    }

    return {
      success: true,
      data: validationResult.data,
    };
  } catch (error) {
    console.error("Excel parsing error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to parse Excel file",
    };
  }
}

/**
 * Check for duplicate emails within the Excel data
 */
export function findDuplicateEmails(users: ExcelRowInput[]): ValidationError[] {
  const emailCounts = new Map<string, number[]>();
  const errors: ValidationError[] = [];

  // Count occurrences and track row numbers
  users.forEach((user, index) => {
    const email = user.email.toLowerCase();
    const rows = emailCounts.get(email) || [];
    rows.push(index + 2); // +2 because row 1 is header
    emailCounts.set(email, rows);
  });

  // Find duplicates
  for (const [email, rows] of emailCounts) {
    if (rows.length > 1) {
      // Add error for each duplicate row
      rows.forEach((row) => {
        errors.push({
          row,
          field: "email",
          message: `Duplicate email "${email}" found in rows: ${rows.join(", ")}`,
        });
      });
    }
  }

  return errors;
}

/**
 * Generate a random password
 */
export function generateRandomPassword(length: number = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
