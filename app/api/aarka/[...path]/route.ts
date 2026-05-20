import { NextRequest, NextResponse } from "next/server";

// Vercel serverless function config — extend timeout to maximum allowed
// Hobby plan: 60s, Pro plan: 300s
export const maxDuration = 300;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const targetPath = path.join("/");
    const targetUrl = `http://43.204.153.162:5000/${targetPath}`;

    // Get request body
    let body: string | null = null;
    try {
      body = JSON.stringify(await request.json());
    } catch {
      // Body might be empty
    }

    // Forward headers (especially Authorization)
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const authHeader = request.headers.get("Authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    // Use AbortController with a generous timeout for the slow backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 290_000); // 290s safety margin

    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: body ?? undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseData = await response.json();
    return NextResponse.json(responseData, { status: response.status });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Proxy error:", message);

    const isTimeout = message.includes("abort");
    return NextResponse.json(
      {
        error: isTimeout
          ? "The backend took too long to respond. Please try again."
          : "Failed to connect to the backend server.",
      },
      { status: isTimeout ? 504 : 502 }
    );
  }
}
