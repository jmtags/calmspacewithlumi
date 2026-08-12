"use client";

import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { hasSupabaseConfig, supabase } from "../../lib/supabase/client";
import "./admin.css";

type LoginState = "idle" | "loading";
type AccessState = "checking" | "allowed" | "denied" | "signed-out";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginState, setLoginState] = useState<LoginState>("idle");
  const [accessState, setAccessState] = useState<AccessState>("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!supabase) {
      setAccessState("signed-out");
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
    if (!data) {
      setMessage(`This account is signed in as ${currentUser.email}, but that email is not on the admin allowlist.`);
    }
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
          <div className="admin-empty">
            <h2>Welcome, {user.email}</h2>
            <p>Your basic admin page is ready. We can add content tools, donation reports, APK version management, or app announcements next.</p>
          </div>
        )}
      </section>
    </main>
  );
}
