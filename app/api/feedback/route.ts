import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

type FeedbackResult = {
  ok?: boolean;
  error?: string;
};

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Feedback is not configured yet." }, { status: 200 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid feedback request." }, { status: 400 });
  }

  const rating = Number(body.rating);
  const category = typeof body.category === "string" ? body.category : "";
  const comment = typeof body.comment === "string" ? body.comment : "";
  const pagePath = typeof body.pagePath === "string" ? body.pagePath : "/";
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const honeypot = typeof body.website === "string" ? body.website : "";

  const { data, error } = await supabase.rpc("submit_feedback", {
    p_session_id: sessionId,
    p_rating: rating,
    p_category: category,
    p_comment: comment,
    p_page_path: pagePath,
    p_honeypot: honeypot,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const result = data as FeedbackResult;
  return NextResponse.json(result, { status: result.ok ? 200 : 429 });
}
