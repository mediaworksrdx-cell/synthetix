import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const BACKEND = process.env.AARKAAI_BACKEND_URL || 'http://127.0.0.1:5000';
  
  try {
    const { email, name } = await request.json();
    
    const googleUser = {
      email: process.env.GOOGLE_USER_EMAIL || email || "googleuser@gmail.com",
      password: process.env.GOOGLE_USER_PASSWORD || "GoogleSecurePassword123!",
      name: name || "Google User",
    };

    let resp = await fetch(`${BACKEND}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(googleUser),
    });

    if (resp.status !== 200) {
      resp = await fetch(`${BACKEND}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(googleUser),
      });
    }

    if (resp.status === 200) {
      const data = await resp.json();
      return NextResponse.json(data, { status: 200 });
    } else {
      return NextResponse.json({ error: "Google auth failed" }, { status: resp.status });
    }
  } catch (err) {
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 });
  }
}
