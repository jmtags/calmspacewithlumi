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

function LotusMark({ small = false }: { small?: boolean }) {
  return <img className={small ? "brand-mark small" : "brand-mark"} src="/calmspace-art.png" alt="" />;
}

function Luna({ src, className = "", alt = "Lumi, the CalmSpace lotus mascot" }: { src: string; className?: string; alt?: string }) {
  return <img className={`luna ${className}`} src={src} alt={alt} loading="lazy" />;
}

export default function Home() {
  return (
    <main>
      <nav className="nav shell" aria-label="Main navigation">
        <a className="brand" href="#top"><LotusMark small /><span>CalmSpace</span></a>
        <div className="nav-links">
          <a href="#features">Features</a><a href="#privacy">Privacy</a><a href="#support">Support us</a>
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

      <section className="support" id="support"><div className="shell support-inner">
        <div className="support-copy"><span className="kicker light">KEEP CALMSPACE OPEN</span><h2>Free for everyone.<br /><em>Supported by kindness.</em></h2><p>CalmSpace has no subscription and no ads. If it has helped make one difficult moment a little lighter, you can help keep it growing through a voluntary GCash donation.</p><div className="donation-box" aria-label="GCash donation QR details"><span className="donation-label">GCash donation QR</span><div className="donation-qr"><img src={donationDetails.qrCode} alt="GCash donation QR code for CalmSpace" /><span>Scan to donate with GCash</span></div></div></div>
        <div className="support-card"><div className="jar"><Luna src="/mascot/luna-celebrating.png" className="jar-luna" alt="Lumi celebrating support" /><span className="coin c1">♥</span><span className="coin c2">♥</span><span className="coin c3">♥</span></div><h3>Your support helps with</h3><ul><li><span>01</span>Keeping the app and services running</li><li><span>02</span>Building thoughtful new features</li><li><span>03</span>Maintaining privacy and accessibility</li></ul><div className="donation-disclaimer"><b>Donation disclaimer</b><p>Donations are optional, non-refundable gifts used only to support CalmSpace development, maintenance, and operating costs. This is not a charity drive, public-welfare solicitation, or fundraising campaign for beneficiaries.</p><p>Donations do not buy medical, counseling, emergency, or professional services, and they are not represented as tax-deductible contributions.</p></div></div>
      </div></section>

      <section className="final-cta shell" id="try"><Luna src="/mascot/luna-sleeping.png" className="final-luna" alt="Lumi resting peacefully" /><span className="kicker">YOUR CALM SPACE IS READY</span><h2>Take a breath.<br /><em>You&apos;re here now.</em></h2><p>A private, simple companion for the moments you need to pause.</p><a className="button" href="/CalmSpace.apk" download>Download CalmSpace APK <span>↓</span></a></section>

      <footer><div className="shell footer-inner"><a className="brand" href="#top"><LotusMark small /><span>CalmSpace</span></a><p>Made gently for real-life moments.</p><div><a href="#privacy">Privacy</a><a href="#support">Donate</a><a href="mailto:hello@calmspace.app">Contact</a></div></div></footer>
    </main>
  );
}
