import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

const allowedEventTypes = new Set([
  "page_view",
  "section_view",
  "download_click",
  "session_end",
]);

function cleanText(value: unknown, fallback = "unknown") {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, 160)
    : fallback;
}

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Supabase is not configured" }, { status: 200 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = cleanText(body.eventType);
  if (!allowedEventTypes.has(eventType)) {
    return NextResponse.json({ ok: false, error: "Invalid event type" }, { status: 400 });
  }

  const headers = request.headers;
  const country = headers.get("x-vercel-ip-country") || null;
  const region = headers.get("x-vercel-ip-country-region") || null;
  const city = headers.get("x-vercel-ip-city")
    ? decodeURIComponent(headers.get("x-vercel-ip-city") ?? "")
    : null;

  const { error } = await supabase.from("analytics_events").insert({
    event_type: eventType,
    session_id: cleanText(body.sessionId),
    page_path: cleanText(body.pagePath, "/"),
    section_id: typeof body.sectionId === "string" ? body.sectionId.slice(0, 80) : null,
    duration_seconds:
      typeof body.durationSeconds === "number"
        ? Math.max(0, Math.min(Math.round(body.durationSeconds), 86400))
        : null,
    country,
    region,
    city,
    user_agent: headers.get("user-agent")?.slice(0, 300) ?? null,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
