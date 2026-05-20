import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const targetPath = path.join("/");
    const targetUrl = `http://43.204.153.162:5000/${targetPath}`;

    // Get request body
    let body: any = null;
    try {
      body = await request.json();
    } catch {
      // Body might be empty
    }

    // Forward headers (especially Authorization)
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    
    const authHeader = request.headers.get("Authorization");
    if (authHeader) {
      headers.set("Authorization", authHeader);
    }

    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseData = await response.json();
    return NextResponse.json(responseData, { status: response.status });
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to connect to the backend server." },
      { status: 502 }
    );
  }
}
