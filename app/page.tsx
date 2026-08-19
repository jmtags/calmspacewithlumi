import { FeedbackForm } from "./feedback-form";
import { createSupabaseServerClient } from "../lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const facebookUrl = "https://www.facebook.com/profile.php?id=61593585025875";

type PublicReview = {
  id: string;
  created_at: string;
  rating: number;
  category: string;
  comment: string;
};

type ReviewSummary = {
  average: string;
  averageNumber: number;
  distribution: Record<number, number>;
};

const features = [
  { icon: "◌", title: "Calm me now", text: "Follow a gentle guided breathing exercise when you need a quieter moment.", mascot: "/mascot/luna-breathing.png" },
  { icon: "♫", title: "Soothing sounds", text: "Choose rain, ocean, forest, fire, or birds and adjust the volume to what feels right.", mascot: "/mascot/luna-listening.png" },
  { icon: "✦", title: "Mood journal", text: "Name what you feel, add a note, and notice patterns over time—privately on your device.", mascot: "/mascot/luna-journaling.png" },
  { icon: "◎", title: "Simple insights", text: "See your weekly mood flow and learn which people, places, and moments shape your days.", mascot: "/mascot/luna-meditation.png" },
];

const steps = [
  ["01", "Pause", "Open CalmSpace and choose what you need right now."],
  ["02", "Breathe", "Follow a calm prompt or play a sound that helps you settle."],
  ["03", "Reflect", "Check in with your mood and write only what feels useful."],
];

const screenshots = [
  { src: "/screenshots/calmspace-home.png", title: "Daily check-ins", text: "Start with your mood, then choose a gentle reset when you need it." },
  { src: "/screenshots/calmspace-journal.png", title: "Private journaling", text: "Record thoughts, tags, and emotional patterns in a space that feels safe." },
  { src: "/screenshots/calmspace-sounds.png", title: "Soothing sounds", text: "Settle into rain, ocean, forest, and calming audio for quiet moments." },
];

const donationDetails = {
  qrCode: "/donation-qr.png",
};

async function getPublicReviews(): Promise<PublicReview[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("feedback_submissions")
    .select("id,created_at,rating,category,comment")
    .eq("show_on_website", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return [];
  return (data ?? []) as PublicReview[];
}

function LotusMark({ small = false }: { small?: boolean }) {
  return <img className={small ? "brand-mark small" : "brand-mark"} src="/calmspace-art.png" alt="" />;
}

function Luna({ src, className = "", alt = "Lumi, the CalmSpace lotus mascot" }: { src: string; className?: string; alt?: string }) {
  return <img className={`luna ${className}`} src={src} alt={alt} loading="lazy" />;
}

export default async function Home() {
  const publicReviews = await getPublicReviews();
  const reviewSummary = summarizeReviews(publicReviews);
  const firstReviews = publicReviews.slice(0, 3);
  const extraReviews = publicReviews.slice(3);

  return (
    <main>
      <nav className="nav shell" aria-label="Main navigation">
        <a className="brand" href="#top"><LotusMark small /><span>CalmSpace</span></a>
        <div className="nav-links">
          <a href="#features">Features</a><a href="#reviews">Reviews</a><a href="#privacy">Privacy</a><a href="#feedback">Feedback</a><a href="#community">Community</a>
        </div>
        <a className="button button-small" href="/CalmSpace.apk" download>Download APK <span>↓</span></a>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse" /> Free mental wellness companion</div>
          <h1>A gentler space<br />for <em>right now.</em></h1>
          <p className="lede">CalmSpace helps you pause, breathe, name what you feel, and notice the patterns in your day—without pressure, judgment, or a paywall.</p>
          <div className="actions">
            <a className="button" href="/CalmSpace.apk" download>Download CalmSpace APK <span>↓</span></a>
            <a className="text-link" href="#support"><span className="heart">♡</span> Support its journey</a>
          </div>
          <p className="microcopy"><span>✓</span> No subscription &nbsp; <span>✓</span> No ads &nbsp; <span>✓</span> Your entries stay on your device</p>
          <div className="luna-intro">
            <Luna src="/mascot/luna-wave.png" alt="Lumi waving hello" />
            <div><b>Meet Lumi</b><span>A tiny floating lotus for growth, healing, and gentle unfolding.</span></div>
          </div>
        </div>
        <div className="hero-visual" aria-label="CalmSpace mobile app preview">
          <div className="orb orb-one" /><div className="orb orb-two" />
          <div className="phone">
            <img className="hero-screenshot" src="/screenshots/calmspace-home.png" alt="CalmSpace app home screen preview" />
          </div>
          <div className="floating-note note-one"><span>♫</span><div><small>NOW PLAYING</small><b>Soft rain</b></div></div>
          <div className="floating-note note-two"><span>✓</span><div><small>CHECK-IN SAVED</small><b>Your moment is yours</b></div></div>
        </div>
      </section>

      <section className="trust-strip"><div className="shell"><p>Designed for small moments of care</p><span>•</span><p>Private by design</p><span>•</span><p>Always free to use</p></div></section>

      <section className="section shell" id="features">
        <div className="section-intro"><span className="kicker">A LITTLE HELP, WHEN YOU NEED IT</span><h2>Small tools for<br /><em>steadier days.</em></h2><p>No streaks to maintain. No scores to chase. Just simple ways to pause and reconnect with yourself.</p></div>
        <div className="feature-grid">{features.map((f, i) => <article className={`feature feature-${i+1}`} key={f.title}><span className="feature-icon">{f.icon}</span><Luna src={f.mascot} className="feature-luna" alt={`Lumi for ${f.title}`} /><h3>{f.title}</h3><p>{f.text}</p><span className="feature-num">0{i+1}</span></article>)}</div>
      </section>

      <section className="screenshots-section" id="previews">
        <div className="shell">
          <div className="screenshots-intro"><span className="kicker">INSIDE THE APP</span><h2>A soft interface<br />made for <em>real moments.</em></h2><p>Show people what they are downloading: a calm, friendly companion with Lumi, private journaling, and gentle audio tools.</p></div>
          <div className="screenshots-grid">{screenshots.map((s, i) => <article className={`screenshot-card screenshot-${i+1}`} key={s.title}><div className="screenshot-frame"><img src={s.src} alt={`${s.title} screen in the CalmSpace app`} loading="lazy" /></div><div><h3>{s.title}</h3><p>{s.text}</p></div></article>)}</div>
        </div>
      </section>

      <section className="how-section" id="how"><div className="shell how-grid">
        <div className="how-copy"><span className="kicker">HOW IT FEELS</span><h2>One quiet moment<br />at a time.</h2><p className="how-lede">CalmSpace meets you where you are. There is no perfect way to use it.</p><Luna src="/mascot/lumi-how-it-feels.png" className="how-lumi" alt="Lumi meditating peacefully" /></div>
        <div className="steps">{steps.map((s) => <div className="step" key={s[0]}><span>{s[0]}</span><div><h3>{s[1]}</h3><p>{s[2]}</p></div></div>)}</div>
      </div></section>

      <section className="privacy shell" id="privacy">
        <div className="privacy-art"><Luna src="/mascot/luna-comfort.png" className="privacy-luna" alt="Lumi offering comfort" /></div>
        <div className="privacy-copy"><span className="kicker">YOUR SPACE IS YOURS</span><h2>Personal reflection<br />should stay <em>personal.</em></h2><p>Your name, journal entries, moods, and settings are saved locally on your phone. CalmSpace is designed as a private self-care companion—not a place that profits from your feelings.</p><div className="privacy-list"><span>✓ Local device storage</span><span>✓ No advertising trackers</span><span>✓ Clear privacy controls</span></div><small>CalmSpace is not a substitute for professional care or emergency support.</small></div>
      </section>

      <section className="reviews-section" id="reviews"><div className="shell">
        <div className="reviews-intro"><span className="kicker">USER FEEDBACK</span><h2>Ratings and reviews<br /><em>from anonymous users.</em></h2><p>These reviews are shared only after admin approval. Names are never shown.</p></div>
        {publicReviews.length ? (
          <div className="reviews-storefront">
            <aside className="reviews-score" aria-label="Average approved review rating">
              <strong>{reviewSummary.average}</strong>
              <span aria-label={`${reviewSummary.average} out of 5 stars`}>{formatStars(Math.round(reviewSummary.averageNumber))}</span>
              <small>{publicReviews.length} anonymous review{publicReviews.length === 1 ? "" : "s"}</small>
              <div className="rating-bars" aria-hidden="true">
                {[5, 4, 3, 2, 1].map((rating) => <div className="rating-bar" key={rating}><span>{rating}</span><b><i style={{ width: `${reviewSummary.distribution[rating]}%` }} /></b></div>)}
              </div>
            </aside>
            <div className="reviews-list">
              {firstReviews.map((review) => <ReviewCard review={review} key={review.id} />)}
              {extraReviews.length > 0 && (
                <details className="reviews-more">
                  <summary>Show more reviews</summary>
                  <div className="reviews-more-list">
                    {extraReviews.map((review) => <ReviewCard review={review} key={review.id} />)}
                  </div>
                </details>
              )}
            </div>
          </div>
        ) : (
          <div className="reviews-empty"><p>Approved anonymous reviews will appear here soon.</p></div>
        )}
      </div></section>

      <section className="feedback-section" id="feedback"><div className="shell feedback-inner">
        <div className="feedback-copy"><span className="kicker">HELP CALMSPACE GROW</span><h2>Your thoughts can make<br /><em>Lumi gentler.</em></h2><p>Tell us what feels helpful, confusing, missing, or worth improving in the app or website.</p><small>All comments and suggestions are anonymous. Please avoid sharing names, phone numbers, email addresses, or private health details.</small></div>
        <div className="feedback-card"><FeedbackForm /></div>
      </div></section>

      <section className="community-section" id="community"><div className="shell community-inner">
        <div><span className="kicker">COMMUNITY UPDATES</span><h2>Follow CalmSpace<br /><em>with Lumi.</em></h2><p>Visit the Facebook page for app updates, news, and gentle community support around mental health and self-care.</p></div>
        <a className="button" href={facebookUrl} target="_blank" rel="noreferrer">Open Facebook page <span>â†’</span></a>
      </div></section>

      <section className="support" id="support"><div className="shell support-inner">
        <div className="support-copy"><span className="kicker light">KEEP CALMSPACE OPEN</span><h2>Free for everyone.<br /><em>Supported by kindness.</em></h2><p>CalmSpace has no subscription and no ads. If it has helped make one difficult moment a little lighter, you can help keep it growing through a voluntary GCash donation.</p><div className="donation-box" aria-label="GCash donation QR details"><span className="donation-label">GCash donation QR</span><div className="donation-qr"><img src={donationDetails.qrCode} alt="GCash donation QR code for CalmSpace" /><span>Scan to donate with GCash</span></div></div></div>
        <div className="support-card"><div className="jar"><Luna src="/mascot/luna-celebrating.png" className="jar-luna" alt="Lumi celebrating support" /><span className="coin c1">♥</span><span className="coin c2">♥</span><span className="coin c3">♥</span></div><h3>Your support helps with</h3><ul><li><span>01</span>Keeping the app and services running</li><li><span>02</span>Building thoughtful new features</li><li><span>03</span>Maintaining privacy and accessibility</li></ul><div className="donation-disclaimer"><b>Donation disclaimer</b><p>Donations are optional, non-refundable gifts used only to support CalmSpace development, maintenance, and operating costs. This is not a charity drive, public-welfare solicitation, or fundraising campaign for beneficiaries.</p><p>Donations do not buy medical, counseling, emergency, or professional services, and they are not represented as tax-deductible contributions.</p></div></div>
      </div></section>

      <section className="final-cta shell" id="try"><Luna src="/mascot/luna-sleeping.png" className="final-luna" alt="Lumi resting peacefully" /><span className="kicker">YOUR CALM SPACE IS READY</span><h2>Take a breath.<br /><em>You&apos;re here now.</em></h2><p>A private, simple companion for the moments you need to pause.</p><a className="button" href="/CalmSpace.apk" download>Download CalmSpace APK <span>↓</span></a></section>

      <footer><div className="shell footer-inner"><a className="brand" href="#top"><LotusMark small /><span>CalmSpace</span></a><p>Made gently for real-life moments.</p><div><a href="#privacy">Privacy</a><a href="#feedback">Feedback</a><a href="#support">Donate</a><a href={facebookUrl} target="_blank" rel="noreferrer">Facebook</a><a href="mailto:hello@calmspace.app">Contact</a></div></div></footer>
    </main>
  );
}

function formatReviewCategory(category: string) {
  if (category === "both") return "App + website";
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function ReviewCard({ review }: { review: PublicReview }) {
  return (
    <article className="review-card">
      <div className="review-card-top">
        <div>
          <span className="review-stars" aria-label={`${review.rating} out of 5 stars`}>{formatStars(review.rating)}</span>
          <small>Anonymous - {formatReviewCategory(review.category)} - {formatReviewDate(review.created_at)}</small>
        </div>
      </div>
      <p>{review.comment}</p>
    </article>
  );
}

function summarizeReviews(reviews: PublicReview[]): ReviewSummary {
  const counts = reviews.reduce<Record<number, number>>((items, review) => {
    items[review.rating] = (items[review.rating] ?? 0) + 1;
    return items;
  }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const total = reviews.length || 1;
  const averageNumber = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return {
    average: averageNumber.toFixed(1),
    averageNumber,
    distribution: {
      1: (counts[1] / total) * 100,
      2: (counts[2] / total) * 100,
      3: (counts[3] / total) * 100,
      4: (counts[4] / total) * 100,
      5: (counts[5] / total) * 100,
    },
  };
}

function formatReviewDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatStars(rating: number) {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating)));
  return "\u2605".repeat(safeRating) + "\u2606".repeat(5 - safeRating);
}
