import { NextRequest, NextResponse } from "next/server";

// ─── Vercel max function duration (Pro = 300s, Hobby = 60s max) ───────────────
// Set to 60 to stay within Hobby plan limits. For Pro plan you can raise to 300.
export const maxDuration = 60;

const BACKEND = "http://43.204.153.162:5000";

function buildHeaders(request: NextRequest, bodyToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  // Priority: 1) x-auth-token header (our fix for Vercel edge stripping)
  //           2) standard authorization header (if not stripped)
  //           3) _token field in request body (fallback for old browser cache)
  const auth =
    request.headers.get("x-auth-token") ||
    request.headers.get("authorization") ||
    request.headers.get("Authorization") ||
    bodyToken;
  if (auth) {
    const token = auth.startsWith("Bearer ") ? auth : `Bearer ${auth}`;
    headers["Authorization"] = token;
  }
  return headers;
}

// ─── POST ─────────────────────────────────────────────────────────────────────
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const targetUrl = `${BACKEND}/${path.join("/")}`;

    let body: string | undefined;
    let bodyToken: string | undefined;
    try {
      const parsed = await request.json();
      // Extract _token from body if present (fallback when Authorization header is stripped)
      if (parsed._token) {
        bodyToken = parsed._token;
        delete parsed._token; // Don't forward the _token field to the backend
      }
      body = JSON.stringify(parsed);
    } catch {
      // empty body — that's fine
    }

    // 55s abort so we always reply before Vercel kills us at 60s
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55_000);

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: buildHeaders(request, bodyToken),
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseData = await response.json();
    return NextResponse.json(responseData, { status: response.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Proxy POST error:", message);

    const isTimeout =
      message.toLowerCase().includes("abort") ||
      message.toLowerCase().includes("timeout");

    return NextResponse.json(
      {
        error: isTimeout
          ? "Aarka AI took too long to respond. Please try again — complex questions may need a moment."
          : "Failed to connect to the Aarka AI backend server.",
      },
      { status: isTimeout ? 504 : 502 }
    );
  }
}

// ─── GET ──────────────────────────────────────────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const targetUrl = `${BACKEND}/${path.join("/")}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: buildHeaders(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseData = await response.json();
    return NextResponse.json(responseData, { status: response.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Proxy GET error:", message);
    return NextResponse.json(
      { error: "Failed to reach Aarka AI backend." },
      { status: 502 }
    );
  }
}
