"use client";

import { useEffect } from "react";

const sessionKey = "calmspace_session_id";
const trackedSections = ["top", "features", "previews", "how", "privacy", "feedback", "support", "try"];

function getSessionId() {
  const existing = window.sessionStorage.getItem(sessionKey);
  if (existing) return existing;

  const nextId = crypto.randomUUID();
  window.sessionStorage.setItem(sessionKey, nextId);
  return nextId;
}

function track(eventType: string, extra: Record<string, unknown> = {}) {
  const payload = {
    eventType,
    sessionId: getSessionId(),
    pagePath: window.location.pathname,
    ...extra,
  };

  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics/track", new Blob([body], { type: "application/json" }));
    return;
  }

  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export function AnalyticsTracker() {
  useEffect(() => {
    const startedAt = Date.now();
    track("page_view");

    const seenSections = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || seenSections.has(entry.target.id)) continue;
          seenSections.add(entry.target.id);
          track("section_view", { sectionId: entry.target.id });
        }
      },
      { threshold: 0.45 }
    );

    for (const sectionId of trackedSections) {
      const element = document.getElementById(sectionId);
      if (element) observer.observe(element);
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>('a[href="/CalmSpace.apk"]')
        : null;
      if (target) {
        track("download_click", { sectionId: target.closest("section")?.id ?? "unknown" });
      }
    };

    const handlePageHide = () => {
      track("session_end", {
        durationSeconds: Math.round((Date.now() - startedAt) / 1000),
      });
    };

    document.addEventListener("click", handleClick);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", handleClick);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  return null;
}
