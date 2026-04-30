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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0d0d" }}>
        <div style={{ color: "#555", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.2em", fontSize: "0.7rem" }}>
          LOADING...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f5f4f0", fontFamily: "'Barlow', sans-serif" }}>

      {/* NAV */}
      <nav style={{ background: "#0d0d0d", borderBottom: "1px solid #1e1e1e", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: "32px", height: "32px", background: "#e8ff47", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1rem", color: "#0d0d0d", lineHeight: 1 }}>F</span>
            </div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#fff", letterSpacing: "0.05em" }}>FLUX</span>
            <span style={{ fontSize: "0.55rem", color: "#444", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.15em", paddingLeft: "0.5rem", borderLeft: "1px solid #2a2a2a" }}>BRUNEI DARUSSALAM</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            {["Features", "Pricing", "Docs"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{ color: "#666", fontSize: "0.75rem", textDecoration: "none", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", fontWeight: 600 }}>{item}</a>
            ))}
            <a href={getLoginUrl()} style={{ background: "#e8ff47", color: "#0d0d0d", padding: "0.5rem 1.25rem", textDecoration: "none", fontSize: "0.7rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.12em", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              SIGN IN <ArrowRight size={12} />
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "#0d0d0d", padding: "6rem 2rem 5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#1a1a1a", border: "1px solid #2a2a2a", padding: "0.35rem 0.85rem", marginBottom: "2rem" }}>
            <div style={{ width: "6px", height: "6px", background: "#e8ff47", borderRadius: "50%" }} />
            <span style={{ color: "#888", fontSize: "0.62rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.18em" }}>BOGSA 2025 · CIDB · OGPC CERTIFIED</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "5rem", alignItems: "center" }}>
            <div>
              <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(3.5rem, 7vw, 6.5rem)", lineHeight: 0.88, color: "#fff", margin: "0 0 1.5rem" }}>
                COST<br /><span style={{ color: "#e8ff47" }}>ESTIMATION</span><br /><span style={{ color: "#444" }}>REIMAGINED</span>
              </h1>
              <p style={{ color: "#888", fontSize: "1rem", lineHeight: 1.7, maxWidth: "440px", marginBottom: "2.5rem" }}>
                Flux digitalises the entire BOQ estimation and tender evaluation workflow for Brunei engineering contractors — powered by the official BOGSA rate database.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <a href={getLoginUrl()} style={{ background: "#e8ff47", color: "#0d0d0d", padding: "0.85rem 2rem", textDecoration: "none", fontSize: "0.72rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.12em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  GET STARTED FREE <ArrowRight size={13} />
                </a>
                <a href="#features" style={{ background: "transparent", color: "#666", padding: "0.85rem 2rem", textDecoration: "none", fontSize: "0.72rem", border: "1px solid #2a2a2a", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.12em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  EXPLORE FEATURES
                </a>
              </div>
              <div style={{ display: "flex", gap: "1.5rem", marginTop: "2.5rem", alignItems: "center", flexWrap: "wrap" }}>
                {["CIDB Registered", "OGPC Pre-Qualified", "PDF Export", "AI-Assisted"].map((badge) => (
                  <div key={badge} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <CheckCircle size={11} style={{ color: "#e8ff47" }} />
                    <span style={{ color: "#555", fontSize: "0.62rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>{badge}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "#2a2a2a" }}>
              {[
                { value: "500+", label: "Rate Items", sub: "BOGSA 2025", accent: "#e8ff47" },
                { value: "4", label: "Trades", sub: "Civil · Mech · Elec · Piping", accent: "#ff6b35" },
                { value: "BND", label: "Currency", sub: "Brunei Dollar", accent: "#47ffe8" },
                { value: "v2025", label: "Edition", sub: "Admin-approved", accent: "#ff47a0" },
              ].map((stat) => (
                <div key={stat.label} style={{ background: "#111", padding: "1.75rem 1.5rem" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "2.2rem", color: stat.accent, lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ color: "#fff", fontSize: "0.65rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em", marginTop: "0.4rem" }}>{stat.label}</div>
                  <div style={{ color: "#444", fontSize: "0.55rem", fontFamily: "'Barlow Condensed', sans-serif", marginTop: "0.25rem" }}>{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ background: "#e8ff47", padding: "0.6rem 0", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: "3rem", paddingLeft: "2rem" }}>
          {Array(4).fill(["BOGSA 2025 Rates", "·", "BOQ Estimation", "·", "Tender Evaluation", "·", "PDF Export", "·", "AI Scope Assistant", "·", "Rate Validation", "·"]).flat().map((t, i) => (
            <span key={i} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.15em", color: "#0d0d0d", whiteSpace: "nowrap" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section style={{ background: "#f5f4f0", padding: "5rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "3rem" }}>
            <div style={{ fontSize: "0.6rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.25em", color: "#999", marginBottom: "0.75rem" }}>HOW IT WORKS</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "2.8rem", color: "#0d0d0d", lineHeight: 0.95 }}>
              FROM SCOPE TO<br /><span style={{ color: "#aaa" }}>SUBMISSION IN 3 STEPS</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "#ddd" }}>
            {[
              { step: "01", title: "Browse Rate Database", desc: "Search and filter 500+ BOGSA-approved line items across civil, mechanical, electrical and piping trades.", icon: Database },
              { step: "02", title: "Build Your BOQ", desc: "Select items, enter quantities, and let Flux auto-calculate totals with real-time rate validation against BOGSA min/max bounds.", icon: FileText },
              { step: "03", title: "Export & Submit", desc: "Generate a professionally formatted PDF Bill of Quantities with your contractor details, ready for tender submission.", icon: BarChart3 },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} style={{ background: "#fff", padding: "2.5rem" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "3.5rem", color: "#f0efe9", lineHeight: 1, marginBottom: "1rem" }}>{s.step}</div>
                  <Icon size={20} style={{ color: "#0d0d0d", marginBottom: "1rem" }} />
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#0d0d0d", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>{s.title}</div>
                  <p style={{ color: "#777", fontSize: "0.875rem", lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ background: "#0d0d0d", padding: "5rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "3rem" }}>
            <div style={{ fontSize: "0.6rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.25em", color: "#555", marginBottom: "0.75rem" }}>PLATFORM FEATURES</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "2.8rem", color: "#fff", lineHeight: 0.95 }}>
              BUILT FOR BRUNEI<br /><span style={{ color: "#444" }}>ENGINEERING CONTRACTORS</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1px", background: "#1e1e1e" }}>
            {[
              { icon: Database, color: "#e8ff47", title: "BOGSA Rate Database", desc: "Comprehensive schedule of rates covering civil, mechanical, electrical, and piping trades. Denominated in BND, updated annually by administrators.", tag: "Core" },
              { icon: FileText, color: "#47ffe8", title: "BOQ Estimation Form", desc: "Select rate items, enter quantities, and auto-calculate line totals. Export a formatted PDF Bill of Quantities with full contractor details.", tag: "Core" },
              { icon: Shield, color: "#ff6b35", title: "Rate Validation", desc: "Automatic flagging of line items where the submitted rate falls outside BOGSA acceptable min/max range. Clear visual indicators on every flagged item.", tag: "Compliance" },
              { icon: Zap, color: "#ff47a0", title: "AI Scope Assistant", desc: "Describe your work scope in plain English. The AI assistant maps your description to matching BOGSA rate line items for direct BOQ addition.", tag: "AI-Powered" },
            ].map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} style={{ background: "#111", padding: "2.5rem", position: "relative" }}>
                  <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "#1a1a1a", border: "1px solid #2a2a2a", padding: "0.2rem 0.6rem", fontSize: "0.55rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.15em", color: "#555" }}>{feat.tag}</div>
                  <div style={{ width: "40px", height: "40px", background: feat.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                    <Icon size={18} style={{ color: "#0d0d0d" }} />
                  </div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#fff", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>{feat.title}</div>
                  <p style={{ color: "#666", fontSize: "0.875rem", lineHeight: 1.65 }}>{feat.desc}</p>
                  <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: "0.35rem", color: feat.color, fontSize: "0.65rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>
                    LEARN MORE <ChevronRight size={11} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section style={{ background: "#f5f4f0", padding: "5rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "3rem" }}>
            <div style={{ fontSize: "0.6rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.25em", color: "#999", marginBottom: "0.75rem" }}>WHO IT'S FOR</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "2.8rem", color: "#0d0d0d", lineHeight: 0.95 }}>
              TAILORED FOR<br /><span style={{ color: "#aaa" }}>EVERY ROLE</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
            {[
              { icon: Users, title: "CIDB Contractors", desc: "Access the full BOGSA rate database, build BOQs, and submit validated estimates — all in one platform.", items: ["Rate database access", "BOQ builder", "PDF export", "AI scope assist"] },
              { icon: Shield, title: "OGPC Pre-Qualified", desc: "Ensure every submission meets BOGSA compliance requirements with built-in rate validation and flagging.", items: ["Rate validation", "Min/max flag alerts", "Compliance reports", "Audit trail"] },
              { icon: Clock, title: "Estimators & QS", desc: "Cut estimation time with AI-assisted scope mapping and a searchable, filterable rate database.", items: ["AI scope mapping", "Fast item search", "Bulk BOQ creation", "Version history"] },
            ].map((role) => {
              const Icon = role.icon;
              return (
                <div key={role.title} style={{ background: "#fff", border: "1px solid #e8e7e2", padding: "2rem" }}>
                  <Icon size={22} style={{ color: "#0d0d0d", marginBottom: "1rem" }} />
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#0d0d0d", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>{role.title}</div>
                  <p style={{ color: "#777", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>{role.desc}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {role.items.map((item) => (
                      <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <CheckCircle size={12} style={{ color: "#0d0d0d", flexShrink: 0 }} />
                        <span style={{ fontSize: "0.78rem", color: "#555" }}>{item}</span>
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
      <section id="pricing" style={{ background: "#0d0d0d", padding: "5rem 2rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "0.6rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.25em", color: "#555", marginBottom: "0.75rem" }}>PRICING</div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "2.8rem", color: "#fff", lineHeight: 0.95, marginBottom: "1rem" }}>
            SIMPLE &<br /><span style={{ color: "#444" }}>TRANSPARENT</span>
          </h2>
          <p style={{ color: "#666", marginBottom: "3rem", fontSize: "0.95rem" }}>Register with your CIDB or OGPC credentials to get full access.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "#2a2a2a", maxWidth: "700px", margin: "0 auto" }}>
            {[
              { plan: "Contractor", price: "Free", sub: "For CIDB & OGPC registered firms", features: ["BOGSA rate database", "BOQ builder & estimator", "PDF export", "AI scope assistant", "Rate validation"], cta: "Get Started", primary: false },
              { plan: "Admin", price: "Managed", sub: "For platform administrators", features: ["All contractor features", "Rate version management", "Contractor approval", "Analytics dashboard", "Bulk rate import"], cta: "Contact Us", primary: true },
            ].map((plan) => (
              <div key={plan.plan} style={{ background: plan.primary ? "#e8ff47" : "#111", padding: "2.5rem" }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.2em", color: plan.primary ? "#0d0d0d" : "#666", marginBottom: "0.5rem" }}>{plan.plan.toUpperCase()}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "3rem", color: plan.primary ? "#0d0d0d" : "#fff", lineHeight: 1, marginBottom: "0.4rem" }}>{plan.price}</div>
                <div style={{ fontSize: "0.75rem", color: "#777", marginBottom: "2rem" }}>{plan.sub}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginBottom: "2rem" }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <CheckCircle size={12} style={{ color: plan.primary ? "#0d0d0d" : "#e8ff47", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.8rem", color: plan.primary ? "#333" : "#888" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href={getLoginUrl()} style={{ display: "block", textAlign: "center", background: plan.primary ? "#0d0d0d" : "#e8ff47", color: plan.primary ? "#e8ff47" : "#0d0d0d", padding: "0.75rem", textDecoration: "none", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.12em" }}>{plan.cta} →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#e8ff47", padding: "4rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "2rem" }}>
          <div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "2.5rem", color: "#0d0d0d", lineHeight: 0.95, marginBottom: "0.5rem" }}>
              READY TO DIGITISE<br />YOUR ESTIMATES?
            </h2>
            <p style={{ color: "#555", fontSize: "0.9rem" }}>Join Brunei engineering contractors already using Flux for BOQ estimation.</p>
          </div>
          <a href={getLoginUrl()} style={{ background: "#0d0d0d", color: "#e8ff47", padding: "1rem 2.5rem", textDecoration: "none", fontSize: "0.75rem", flexShrink: 0, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.12em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            REGISTER / SIGN IN <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#080808", padding: "2.5rem 2rem", borderTop: "1px solid #1a1a1a" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: "24px", height: "24px", background: "#e8ff47", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.75rem", color: "#0d0d0d" }}>F</span>
            </div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#fff" }}>FLUX</span>
            <span style={{ color: "#333", fontSize: "0.6rem", fontFamily: "'Barlow Condensed', sans-serif" }}>· BRUNEI DARUSSALAM · {new Date().getFullYear()}</span>
          </div>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            {["BOGSA Rate Database", "BOQ Estimator", "Contractor Portal", "Admin Panel"].map((link) => (
              <span key={link} style={{ color: "#333", fontSize: "0.62rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", cursor: "pointer" }}>{link}</span>
            ))}
          </div>
          <div style={{ color: "#2a2a2a", fontSize: "0.58rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>
            FOR CIDB & OGPC REGISTERED CONTRACTORS
          </div>
        </div>
      </footer>
    </div>
  );
}
