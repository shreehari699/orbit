import { NextResponse } from "next/server";

import { getImageProvider, ImageProviderNotConfiguredError } from "@/lib/image";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { prompt?: string; size?: "512x512" | "1024x1024" | "1792x1024" | "1024x1792" }
    | null;

  if (!body?.prompt || typeof body.prompt !== "string") {
    return NextResponse.json({ error: "A `prompt` string is required." }, { status: 400 });
  }

  const provider = getImageProvider();

  if (!provider.configured) {
    return NextResponse.json({ configured: false }, { status: 200 });
  }

  try {
    const result = await provider.generate({ prompt: body.prompt, size: body.size });
    return NextResponse.json({ configured: true, ...result });
  } catch (error) {
    if (error instanceof ImageProviderNotConfiguredError) {
      return NextResponse.json({ configured: false }, { status: 200 });
    }
    console.error("[api/ai/image] provider error:", error);
    return NextResponse.json(
      { configured: true, error: "The image provider request failed." },
      { status: 502 },
    );
  }
}
