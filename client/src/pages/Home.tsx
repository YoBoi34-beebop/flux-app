import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";
import {
  ArrowRight,
  Database,
  FileText,
  Shield,
  Zap,
  CheckCircle,
  ChevronRight,
  BarChart3,
  Users,
  Clock,
} from "lucide-react";

const TICKER_ITEMS = [
  "BOGSA 2025 Rates", "·", "BOQ Estimation", "·", "Tender Evaluation", "·",
  "PDF Export", "·", "AI Scope Assistant", "·", "Rate Validation", "·",
];

const FOOTER_LINKS: { label: string; href: string }[] = [
  { label: "BOGSA Rate Database", href: "/rates" },
  { label: "BOQ Estimator",       href: "/boq" },
  { label: "Contractor Portal",   href: "/profile" },
  { label: "Admin Panel",         href: "/admin" },
];

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [loading, isAuthenticated, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#eff6ff" }}>
        <div style={{ color: "#3b82f6", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.2em", fontSize: "0.7rem" }}>
          LOADING...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#eff6ff", fontFamily: "'Barlow', sans-serif" }}>

      {/* NAV */}
      <nav style={{ background: "#1e3a8a", borderBottom: "1px solid #1d4ed8", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: "32px", height: "32px", background: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1rem", color: "#1e3a8a", lineHeight: 1 }}>F</span>
            </div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#fff", letterSpacing: "0.05em" }}>FLUX</span>
            <span className="home-nav-text" style={{ fontSize: "0.55rem", color: "#93c5fd", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.15em", paddingLeft: "0.5rem", borderLeft: "1px solid #3b82f6" }}>BRUNEI DARUSSALAM</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            {(["Features", "Pricing"] as const).map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="home-nav-text home-nav-link">{item}</a>
            ))}
            <a href={getLoginUrl()} className="home-cta-accent" style={{ padding: "0.5rem 1.25rem", textDecoration: "none", fontSize: "0.7rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.12em", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              SIGN IN <ArrowRight size={12} />
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "#1e3a8a", padding: "6rem 2rem 5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "linear-gradient(rgba(148,196,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,196,255,0.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#1e40af", border: "1px solid #3b82f6", padding: "0.35rem 0.85rem", marginBottom: "2rem" }}>
            <div style={{ width: "6px", height: "6px", background: "#60a5fa", borderRadius: "50%" }} />
            <span style={{ color: "#bfdbfe", fontSize: "0.62rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.18em" }}>BOGSA 2025 · CIDB · OGPC CERTIFIED</span>
          </div>
          <div className="home-hero-grid">
            <div>
              <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(3.5rem, 7vw, 6.5rem)", lineHeight: 0.88, color: "#eff6ff", margin: "0 0 1.5rem" }}>
                COST<br /><span style={{ color: "#60a5fa" }}>ESTIMATION</span><br /><span style={{ color: "#93c5fd" }}>REIMAGINED</span>
              </h1>
              <p style={{ color: "#bfdbfe", fontSize: "1rem", lineHeight: 1.7, maxWidth: "440px", marginBottom: "2.5rem" }}>
                Flux digitalises the entire BOQ estimation and tender evaluation workflow for Brunei engineering contractors — powered by the official BOGSA rate database.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <a href={getLoginUrl()} className="home-cta-accent" style={{ padding: "0.85rem 2rem", textDecoration: "none", fontSize: "0.72rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.12em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  GET STARTED FREE <ArrowRight size={13} />
                </a>
                <a href="#features" style={{ background: "transparent", color: "#93c5fd", padding: "0.85rem 2rem", textDecoration: "none", fontSize: "0.72rem", border: "1px solid #3b82f6", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.12em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  EXPLORE FEATURES
                </a>
              </div>
              <div style={{ display: "flex", gap: "1.5rem", marginTop: "2.5rem", alignItems: "center", flexWrap: "wrap" }}>
                {["CIDB Registered", "OGPC Pre-Qualified", "PDF Export", "AI-Assisted"].map((badge) => (
                  <div key={badge} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <CheckCircle size={11} style={{ color: "#60a5fa" }} />
                    <span style={{ color: "#bfdbfe", fontSize: "0.62rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>{badge}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "#1d4ed8" }}>
              {[
                { value: "500+", label: "Rate Items",  sub: "BOGSA 2025",                  accent: "#60a5fa" },
                { value: "4",    label: "Trades",      sub: "Civil · Mech · Elec · Piping", accent: "#38bdf8" },
                { value: "BND",  label: "Currency",    sub: "Brunei Dollar",                accent: "#a78bfa" },
                { value: "v2025",label: "Edition",     sub: "Admin-approved",               accent: "#34d399" },
              ].map((stat) => (
                <div key={stat.label} style={{ background: "#1e40af", padding: "1.75rem 1.5rem" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "2.2rem", color: stat.accent, lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ color: "#eff6ff", fontSize: "0.65rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em", marginTop: "0.4rem" }}>{stat.label}</div>
                  <div style={{ color: "#93c5fd", fontSize: "0.55rem", fontFamily: "'Barlow Condensed', sans-serif", marginTop: "0.25rem" }}>{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ background: "#2563eb", padding: "0.6rem 0", overflow: "hidden" }}>
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span key={i} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.15em", color: "#fff", whiteSpace: "nowrap" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section style={{ background: "#eff6ff", padding: "5rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "3rem" }}>
            <div style={{ fontSize: "0.6rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.25em", color: "#3b82f6", marginBottom: "0.75rem" }}>HOW IT WORKS</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "2.8rem", color: "#0f172a", lineHeight: 0.95 }}>
              FROM SCOPE TO<br /><span style={{ color: "#93c5fd" }}>SUBMISSION IN 3 STEPS</span>
            </h2>
          </div>
          <div className="home-steps-grid">
            {[
              { step: "01", title: "Browse Rate Database", desc: "Search and filter 500+ BOGSA-approved line items across civil, mechanical, electrical and piping trades.", icon: Database },
              { step: "02", title: "Build Your BOQ", desc: "Select items, enter quantities, and let Flux auto-calculate totals with real-time rate validation against BOGSA min/max bounds.", icon: FileText },
              { step: "03", title: "Export & Submit", desc: "Generate a professionally formatted PDF Bill of Quantities with your contractor details, ready for tender submission.", icon: BarChart3 },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="home-step-card" style={{ padding: "2.5rem" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "3.5rem", color: "#dbeafe", lineHeight: 1, marginBottom: "1rem" }}>{s.step}</div>
                  <Icon size={20} style={{ color: "#1e3a8a", marginBottom: "1rem" }} />
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#0f172a", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>{s.title}</div>
                  <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ background: "#1e3a8a", padding: "5rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "3rem" }}>
            <div style={{ fontSize: "0.6rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.25em", color: "#93c5fd", marginBottom: "0.75rem" }}>PLATFORM FEATURES</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "2.8rem", color: "#eff6ff", lineHeight: 0.95 }}>
              BUILT FOR BRUNEI<br /><span style={{ color: "#93c5fd" }}>ENGINEERING CONTRACTORS</span>
            </h2>
          </div>
          <div className="home-features-grid">
            {[
              { icon: Database, color: "#60a5fa", title: "BOGSA Rate Database",  desc: "Comprehensive schedule of rates covering civil, mechanical, electrical, and piping trades. Denominated in BND, updated annually by administrators.", tag: "Core"       },
              { icon: FileText, color: "#38bdf8", title: "BOQ Estimation Form",  desc: "Select rate items, enter quantities, and auto-calculate line totals. Export a formatted PDF Bill of Quantities with full contractor details.",             tag: "Core"       },
              { icon: Shield,   color: "#f59e0b", title: "Rate Validation",      desc: "Automatic flagging of line items where the submitted rate falls outside BOGSA acceptable min/max range. Clear visual indicators on every flagged item.",     tag: "Compliance" },
              { icon: Zap,      color: "#818cf8", title: "AI Scope Assistant",   desc: "Describe your work scope in plain English. The AI assistant maps your description to matching BOGSA rate line items for direct BOQ addition.",              tag: "AI-Powered" },
            ].map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="home-feature-card" style={{ padding: "2.5rem" }}>
                  <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "#1d4ed8", border: "1px solid #3b82f6", padding: "0.2rem 0.6rem", fontSize: "0.55rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.15em", color: "#93c5fd" }}>{feat.tag}</div>
                  <div style={{ width: "40px", height: "40px", background: feat.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                    <Icon size={18} style={{ color: "#1e3a8a" }} />
                  </div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#eff6ff", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>{feat.title}</div>
                  <p style={{ color: "#bfdbfe", fontSize: "0.875rem", lineHeight: 1.65 }}>{feat.desc}</p>
                  <a href={getLoginUrl()} style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: "0.35rem", color: feat.color, fontSize: "0.65rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textDecoration: "none" }}>
                    LEARN MORE <ChevronRight size={11} />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section style={{ background: "#eff6ff", padding: "5rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "3rem" }}>
            <div style={{ fontSize: "0.6rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.25em", color: "#3b82f6", marginBottom: "0.75rem" }}>WHO IT'S FOR</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "2.8rem", color: "#0f172a", lineHeight: 0.95 }}>
              TAILORED FOR<br /><span style={{ color: "#93c5fd" }}>EVERY ROLE</span>
            </h2>
          </div>
          <div className="home-roles-grid">
            {[
              { icon: Users,  title: "CIDB Contractors",   desc: "Access the full BOGSA rate database, build BOQs, and submit validated estimates — all in one platform.",               items: ["Rate database access", "BOQ builder", "PDF export", "AI scope assist"] },
              { icon: Shield, title: "OGPC Pre-Qualified", desc: "Ensure every submission meets BOGSA compliance requirements with built-in rate validation and flagging.",              items: ["Rate validation", "Min/max flag alerts", "Compliance reports", "Audit trail"] },
              { icon: Clock,  title: "Estimators & QS",    desc: "Cut estimation time with AI-assisted scope mapping and a searchable, filterable rate database.",                        items: ["AI scope mapping", "Fast item search", "Bulk BOQ creation", "Version history"] },
            ].map((role) => {
              const Icon = role.icon;
              return (
                <div key={role.title} className="home-role-card" style={{ padding: "2rem" }}>
                  <Icon size={22} style={{ color: "#1e3a8a", marginBottom: "1rem" }} />
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#0f172a", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>{role.title}</div>
                  <p style={{ color: "#64748b", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>{role.desc}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {role.items.map((item) => (
                      <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <CheckCircle size={12} style={{ color: "#2563eb", flexShrink: 0 }} />
                        <span style={{ fontSize: "0.78rem", color: "#374151" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ background: "#1e3a8a", padding: "5rem 2rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "0.6rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.25em", color: "#93c5fd", marginBottom: "0.75rem" }}>PRICING</div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "2.8rem", color: "#eff6ff", lineHeight: 0.95, marginBottom: "1rem" }}>
            SIMPLE &<br /><span style={{ color: "#93c5fd" }}>TRANSPARENT</span>
          </h2>
          <p style={{ color: "#bfdbfe", marginBottom: "3rem", fontSize: "0.95rem" }}>Register with your CIDB or OGPC credentials to get full access.</p>
          <div className="home-pricing-grid">
            {[
              { plan: "Contractor", price: "Free",    sub: "For CIDB & OGPC registered firms",  features: ["BOGSA rate database", "BOQ builder & estimator", "PDF export", "AI scope assistant", "Rate validation"],       cta: "Get Started", href: getLoginUrl(),             primary: false },
              { plan: "Admin",      price: "Managed", sub: "For platform administrators",        features: ["All contractor features", "Rate version management", "Contractor approval", "Analytics dashboard", "Bulk rate import"], cta: "Contact Us",  href: "mailto:admin@fluxbn.com", primary: true  },
            ].map((plan) => (
              <div key={plan.plan} style={{ background: plan.primary ? "#2563eb" : "#1e40af", padding: "2.5rem" }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.2em", color: plan.primary ? "#dbeafe" : "#93c5fd", marginBottom: "0.5rem" }}>{plan.plan.toUpperCase()}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "3rem", color: "#eff6ff", lineHeight: 1, marginBottom: "0.4rem" }}>{plan.price}</div>
                <div style={{ fontSize: "0.75rem", color: "#93c5fd", marginBottom: "2rem" }}>{plan.sub}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginBottom: "2rem" }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <CheckCircle size={12} style={{ color: "#60a5fa", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.8rem", color: "#bfdbfe" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href={plan.href} style={{ display: "block", textAlign: "center", background: plan.primary ? "#eff6ff" : "#60a5fa", color: plan.primary ? "#1e3a8a" : "#fff", padding: "0.75rem", textDecoration: "none", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.12em" }}>{plan.cta} →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#2563eb", padding: "4rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "2rem" }}>
          <div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "2.5rem", color: "#eff6ff", lineHeight: 0.95, marginBottom: "0.5rem" }}>
              READY TO DIGITISE<br />YOUR ESTIMATES?
            </h2>
            <p style={{ color: "#bfdbfe", fontSize: "0.9rem" }}>Join Brunei engineering contractors already using Flux for BOQ estimation.</p>
          </div>
          <a href={getLoginUrl()} className="home-cta-dark" style={{ padding: "1rem 2.5rem", textDecoration: "none", fontSize: "0.75rem", flexShrink: 0, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.12em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            REGISTER / SIGN IN <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0f172a", padding: "2.5rem 2rem", borderTop: "1px solid #1e3a8a" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: "24px", height: "24px", background: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.75rem", color: "#1e3a8a" }}>F</span>
            </div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#fff" }}>FLUX</span>
            <span style={{ color: "#475569", fontSize: "0.6rem", fontFamily: "'Barlow Condensed', sans-serif" }}>· BRUNEI DARUSSALAM · {new Date().getFullYear()}</span>
          </div>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            {FOOTER_LINKS.map(({ label, href }) => (
              <a key={label} href={href} className="home-footer-link">{label}</a>
            ))}
          </div>
          <div style={{ color: "#475569", fontSize: "0.58rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>
            FOR CIDB & OGPC REGISTERED CONTRACTORS
          </div>
        </div>
      </footer>
    </div>
  );
}
