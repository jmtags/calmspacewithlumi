"use client";

import { FormEvent, useState } from "react";

const sessionKey = "calmspace_session_id";

function getSessionId() {
  const existing = window.sessionStorage.getItem(sessionKey);
  if (existing) return existing;

  const nextId = crypto.randomUUID();
  window.sessionStorage.setItem(sessionKey, nextId);
  return nextId;
}

export function FeedbackForm() {
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState("app");
  const [comment, setComment] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [message, setMessage] = useState("");

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating,
        category,
        comment,
        website,
        sessionId: getSessionId(),
        pagePath: window.location.pathname,
      }),
    });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      setStatus("idle");
      setMessage(result.error ?? "Unable to send feedback right now.");
      return;
    }

    setStatus("sent");
    setComment("");
    setMessage("Thank you. Your anonymous feedback helps shape CalmSpace.");
  }

  return (
    <form className="feedback-form" onSubmit={submitFeedback}>
      <div className="rating-row" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            className={rating >= value ? "rating-button active" : "rating-button"}
            key={value}
            type="button"
            onClick={() => setRating(value)}
            aria-label={`${value} out of 5`}
          >
            ★
          </button>
        ))}
      </div>

      <div className="feedback-options" aria-label="Feedback category">
        {[
          ["app", "App"],
          ["website", "Website"],
          ["both", "Both"],
        ].map(([value, label]) => (
          <button
            className={category === value ? "feedback-option active" : "feedback-option"}
            key={value}
            type="button"
            onClick={() => setCategory(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="feedback-honeypot">
        Website
        <input value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" />
      </label>

      <label>
        <span>What can we improve?</span>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          minLength={10}
          maxLength={1000}
          placeholder="Share a suggestion, issue, or idea..."
          required
        />
      </label>

      <button className="button feedback-submit" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending..." : "Send anonymous feedback"}
      </button>

      {message && <p className={status === "sent" ? "feedback-message success" : "feedback-message"}>{message}</p>}
    </form>
  );
}
