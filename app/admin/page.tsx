"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { hasSupabaseConfig, supabase } from "../../lib/supabase/client";
import "./admin.css";

type LoginState = "idle" | "loading";
type AccessState = "checking" | "allowed" | "denied" | "signed-out";
type CountItem = { label: string; count: number };
type FeedbackItem = {
  createdAt: string;
  rating: number;
  category: string;
  comment: string;
  pagePath: string;
};
type Stats = {
  allTimeDownloads: number;
  downloads: number;
  pageViews: number;
  uniqueSessions: number;
  averageStaySeconds: number;
  feedbackCount: number;
  averageRating: number;
  feedbackCategories: CountItem[];
  recentFeedback: FeedbackItem[];
  topLocations: CountItem[];
  allLocations: CountItem[];
  topSections: CountItem[];
  topPages: CountItem[];
};

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginState, setLoginState] = useState<LoginState>("idle");
  const [accessState, setAccessState] = useState<AccessState>(() => hasSupabaseConfig() ? "checking" : "signed-out");
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsMessage, setStatsMessage] = useState("");
  const [showAllLocations, setShowAllLocations] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      if (!currentUser) {
        setAccessState("signed-out");
        return;
      }
      checkAdminAccess(currentUser);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (!currentUser) {
        setAccessState("signed-out");
        return;
      }
      checkAdminAccess(currentUser);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function checkAdminAccess(currentUser: User) {
    if (!supabase) return;

    setAccessState("checking");
    setMessage("");

    const { data, error } = await supabase
      .from("admin_users")
      .select("id")
      .ilike("email", currentUser.email ?? "")
      .maybeSingle();

    if (error) {
      setAccessState("denied");
      setMessage("Admin access could not be verified. Make sure the admin_users migration has been applied.");
      return;
    }

    setAccessState(data ? "allowed" : "denied");
    if (data) {
      await loadStats();
    }
    if (!data) {
      setMessage(`This account is signed in as ${currentUser.email}, but that email is not on the admin allowlist.`);
    }
  }

  async function loadStats() {
    if (!supabase) return;

    setStatsMessage("Loading analytics...");
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      setStatsMessage("Your admin session expired. Please sign in again.");
      return;
    }

    const response = await fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json();

    if (!response.ok) {
      setStatsMessage(result.error ?? "Unable to load analytics.");
      return;
    }

    setStats(result);
    setStatsMessage("");
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;

    setLoginState("loading");
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoginState("idle");

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.user) {
      setUser(data.user);
      await checkAdminAccess(data.user);
    }
  }

  async function handleLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setAccessState("signed-out");
    setPassword("");
    setMessage("");
  }

  if (!hasSupabaseConfig()) {
    return (
      <main className="admin-page">
        <section className="admin-panel">
          <span className="admin-kicker">CalmSpace Admin</span>
          <h1>Supabase is not configured yet.</h1>
          <p>Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel, or keep `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for local development.</p>
        </section>
      </main>
    );
  }

  if (!user || accessState === "signed-out") {
    return (
      <main className="admin-page">
        <section className="admin-panel">
          <span className="admin-kicker">CalmSpace Admin</span>
          <h1>Sign in to manage CalmSpace.</h1>
          <p>Use a Supabase Auth account that has been added to the `admin_users` allowlist.</p>
          <form className="admin-form" onSubmit={handleLogin}>
            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
            <button className="admin-button" type="submit" disabled={loginState === "loading"}>
              {loginState === "loading" ? "Signing in..." : "Sign in"}
            </button>
          </form>
          {message && <p className="admin-message">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <section className="admin-panel admin-dashboard">
        <div className="admin-header">
          <div>
            <span className="admin-kicker">CalmSpace Admin</span>
            <h1>Admin dashboard</h1>
          </div>
          <button className="admin-button secondary" type="button" onClick={handleLogout}>Sign out</button>
        </div>

        {accessState === "checking" && <p className="admin-message">Checking admin access...</p>}

        {accessState === "denied" && (
          <div className="admin-empty">
            <h2>Access not allowed</h2>
            <p>{message}</p>
          </div>
        )}

        {accessState === "allowed" && (
          <div className="analytics-dashboard">
            <div className="admin-empty">
              <h2>Welcome, {user.email}</h2>
              <p>Analytics update as visitors use the website. Download totals count APK download clicks, not confirmed installs. Location depends on deployment headers, so local traffic may appear as Unknown.</p>
            </div>

            {statsMessage && <p className="admin-message">{statsMessage}</p>}

            {stats && (
              <>
                <div className="stats-grid">
                  <StatCard label="All APK downloads" value={stats.allTimeDownloads} />
                  <StatCard label="APK downloads (30d)" value={stats.downloads} />
                  <StatCard label="Page views" value={stats.pageViews} />
                  <StatCard label="Unique sessions" value={stats.uniqueSessions} />
                  <StatCard label="Average stay" value={formatDuration(stats.averageStaySeconds)} />
                  <StatCard label="Feedback sent" value={stats.feedbackCount} />
                  <StatCard label="Average rating" value={stats.averageRating ? `${stats.averageRating}/5` : "No data"} />
                </div>

                <div className="stats-lists">
                  <StatsList
                    title={showAllLocations ? "All locations" : "Top locations"}
                    items={showAllLocations ? stats.allLocations : stats.topLocations}
                    action={stats.allLocations.length > stats.topLocations.length ? (
                      <button
                        className="stats-list-action"
                        type="button"
                        onClick={() => setShowAllLocations((value) => !value)}
                      >
                        {showAllLocations ? "Show top" : `View all ${stats.allLocations.length}`}
                      </button>
                    ) : null}
                  />
                  <StatsList title="Most viewed sections" items={stats.topSections} />
                  <StatsList title="Feedback topics" items={stats.feedbackCategories} />
                  <StatsList title="Top pages" items={stats.topPages} />
                </div>

                <FeedbackReviews reviews={stats.recentFeedback} />
              </>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return <article className="stat-card"><span>{label}</span><strong>{value}</strong></article>;
}

function FeedbackReviews({ reviews }: { reviews: FeedbackItem[] }) {
  return (
    <article className="feedback-reviews">
      <div className="stats-list-header">
        <h2>User reviews</h2>
        <span>{reviews.length ? `${reviews.length} latest` : "No data"}</span>
      </div>
      {reviews.length ? (
        <ol>
          {reviews.map((review) => (
            <li key={`${review.createdAt}-${review.comment}`}>
              <div className="review-meta">
                <strong>{review.rating}/5</strong>
                <span>{formatFeedbackCategory(review.category)} - {formatDateTime(review.createdAt)}</span>
              </div>
              <p>{review.comment}</p>
              <small>{review.pagePath}</small>
            </li>
          ))}
        </ol>
      ) : (
        <p>No reviews yet.</p>
      )}
    </article>
  );
}

function StatsList({ title, items, action }: { title: string; items: CountItem[]; action?: ReactNode }) {
  return (
    <article className="stats-list">
      <div className="stats-list-header">
        <h2>{title}</h2>
        {action}
      </div>
      {items.length ? (
        <ol>{items.map((item) => <li key={item.label}><span>{item.label}</span><b>{item.count}</b></li>)}</ol>
      ) : (
        <p>No data yet.</p>
      )}
    </article>
  );
}

function formatFeedbackCategory(category: string) {
  if (category === "both") return "App + website";
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}m ${rest}s`;
}
