import { NextResponse } from "next/server";
import { TOKEN_COOKIE_CONFIG } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json(
    {
      success: true,
      message: "Logged out successfully",
    },
    { status: 200 }
  );

  // Clear the auth cookie
  response.cookies.set(TOKEN_COOKIE_CONFIG.name, "", {
    ...TOKEN_COOKIE_CONFIG.options,
    maxAge: 0,
  });

  return response;
}
