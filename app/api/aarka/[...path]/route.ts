import { NextRequest, NextResponse } from "next/server";
import http from "http";

const BACKEND = process.env.AARKAAI_BACKEND_URL || "http://194.68.245.29:5000";
const BACKEND_URL = new URL(BACKEND);

function buildHeaders(request: NextRequest, bodyToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
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
    const targetPath = `/${path.join("/")}`;

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const auth =
        request.headers.get("x-auth-token") ||
        request.headers.get("authorization") ||
        request.headers.get("Authorization");

      const backendHeaders: Record<string, string> = {};
      if (auth) {
        backendHeaders["Authorization"] = auth.startsWith("Bearer ") ? auth : `Bearer ${auth}`;
      }

      const response = await fetch(`${BACKEND}/upload`, {
        method: "POST",
        headers: backendHeaders,
        body: formData,
      });

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    let body: string | undefined;
    let bodyToken: string | undefined;
    try {
      const parsed = await request.json();
      if (parsed._token) {
        bodyToken = parsed._token;
        delete parsed._token;
      }
      body = JSON.stringify(parsed);
    } catch {
      // empty body — that's fine
    }

    const headers = buildHeaders(request, bodyToken);

    return new Promise<NextResponse>((resolve, reject) => {
      const req = http.request(
        {
          hostname: BACKEND_URL.hostname,
          port: BACKEND_URL.port ? parseInt(BACKEND_URL.port) : 80,
          path: targetPath,
          method: "POST",
          headers: headers,
        },
        (res) => {
          const contentType = res.headers["content-type"];
          if (contentType && contentType.includes("text/event-stream")) {
            // Convert Node.js IncomingMessage response to a ReadableStream
            let isClosed = false;
            const stream = new ReadableStream({
              start(controller) {
                res.on("data", (chunk) => {
                  if (isClosed) return;
                  try {
                    controller.enqueue(chunk);
                  } catch (err) {
                    isClosed = true;
                  }
                });
                res.on("end", () => {
                  if (isClosed) return;
                  isClosed = true;
                  try {
                    controller.close();
                  } catch (err) {}
                });
                res.on("error", (err) => {
                  if (isClosed) return;
                  isClosed = true;
                  try {
                    controller.error(err);
                  } catch (err) {}
                });
              },
              cancel() {
                isClosed = true;
                res.destroy();
              }
            });
            resolve(
              new NextResponse(stream, {
                status: res.statusCode,
                headers: {
                  "Content-Type": "text/event-stream",
                  "Cache-Control": "no-cache, no-transform",
                  "Connection": "keep-alive",
                },
              })
            );
          } else {
            // Buffer JSON/text responses
            let data = "";
            res.on("data", (chunk) => {
              data += chunk;
            });
            res.on("end", () => {
              try {
                const parsed = JSON.parse(data);
                resolve(NextResponse.json(parsed, { status: res.statusCode }));
              } catch {
                resolve(new NextResponse(data, { status: res.statusCode }));
              }
            });
          }
        }
      );

      req.on("error", (err) => {
        console.error("Proxy POST HTTP error:", err.message);
        reject(err);
      });

      if (body) {
        req.write(body);
      }
      req.end();
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Proxy POST handler error:", message);
    return NextResponse.json(
      {
        error: "Failed to connect to the Aarka AI backend server: " + message,
      },
      { status: 502 }
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
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

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
