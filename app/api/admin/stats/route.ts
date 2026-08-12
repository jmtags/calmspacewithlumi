import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

type AnalyticsEvent = {
  event_type: string;
  session_id: string;
  page_path: string;
  section_id: string | null;
  duration_seconds: number | null;
  country: string | null;
  region: string | null;
  city: string | null;
};

type FeedbackSubmission = {
  rating: number;
  category: string;
};

function topCounts(values: Array<string | null | undefined>, fallback = "Unknown") {
  const counts = new Map<string, number>();
  for (const value of values) {
    const key = value || fallback;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!accessToken) {
    return NextResponse.json({ error: "Missing access token" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient(accessToken);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const email = userData.user?.email;

  if (userError || !email) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  if (adminError || !adminUser) {
    return NextResponse.json({ error: "Access not allowed" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("analytics_events")
    .select("event_type,session_id,page_path,section_id,duration_seconds,country,region,city")
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const events = (data ?? []) as AnalyticsEvent[];
  const { data: feedbackData, error: feedbackError } = await supabase
    .from("feedback_submissions")
    .select("rating,category")
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .limit(5000);

  if (feedbackError) {
    return NextResponse.json({ error: feedbackError.message }, { status: 500 });
  }

  const feedback = (feedbackData ?? []) as FeedbackSubmission[];
  const downloads = events.filter((event) => event.event_type === "download_click").length;
  const pageViews = events.filter((event) => event.event_type === "page_view").length;
  const uniqueSessions = new Set(events.map((event) => event.session_id)).size;
  const sessionDurations = events
    .filter((event) => event.event_type === "session_end" && typeof event.duration_seconds === "number")
    .map((event) => event.duration_seconds ?? 0);
  const averageStaySeconds = sessionDurations.length
    ? Math.round(sessionDurations.reduce((sum, value) => sum + value, 0) / sessionDurations.length)
    : 0;

  return NextResponse.json({
    downloads,
    pageViews,
    uniqueSessions,
    averageStaySeconds,
    feedbackCount: feedback.length,
    averageRating: feedback.length
      ? Number((feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length).toFixed(1))
      : 0,
    feedbackCategories: topCounts(feedback.map((item) => item.category)),
    topLocations: topCounts(
      events.map((event) => [event.city, event.region, event.country].filter(Boolean).join(", "))
    ),
    topSections: topCounts(
      events
        .filter((event) => event.event_type === "section_view")
        .map((event) => event.section_id)
    ),
    topPages: topCounts(events.map((event) => event.page_path)),
  });
}
