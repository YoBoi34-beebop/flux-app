import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  BarChart3,
  BookOpen,
  Bot,
  Building2,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { useLocation } from "wouter";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/rates", label: "Rate Database", icon: BookOpen },
  { href: "/boq", label: "BOQ Estimator", icon: FileText },
  { href: "/profile", label: "My Profile", icon: User },
];

const adminItems = [
  { href: "/admin", label: "Admin Overview", icon: BarChart3 },
  { href: "/admin/rates", label: "Manage Rates", icon: Settings },
  { href: "/admin/contractors", label: "Contractors", icon: Building2 },
];

export default function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      logout();
      setLocation("/");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#1a1a1a" }}>
        <div className="text-center">
          <div className="ind-subtext text-gray-400 mb-4">Loading</div>
          <div className="w-8 h-1 bg-white mx-auto animate-pulse" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const isAdmin = user?.role === "admin";

  return (
    <div className="flex min-h-screen" style={{ background: "#f0f0f0" }}>
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside style={{ width: "240px", background: "#1a1a1a", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        {/* Logo */}
        <div className="px-6 py-6" style={{ borderBottom: "1px solid #2d2d2d" }}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 flex items-center justify-center" style={{ background: "#ffffff" }}>
              <span className="text-black font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.65rem", letterSpacing: "0.05em" }}>F</span>
            </div>
            <div>
              <div className="ind-label text-white" style={{ fontSize: "0.65rem" }}>FLUX</div>
              <div className="ind-subtext" style={{ color: "#666666", fontSize: "0.5rem" }}>Brunei Darussalam</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4">
          <div className="px-4 mb-2">
            <div className="ind-subtext" style={{ color: "#555555", fontSize: "0.55rem" }}>Navigation</div>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.65rem 1.25rem",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontSize: "0.72rem",
                  color: active ? "#ffffff" : "#888888",
                  textDecoration: "none",
                  borderLeft: `3px solid ${active ? "#ffffff" : "transparent"}`,
                  background: active ? "#2d2d2d" : "transparent",
                  transition: "all 0.1s ease",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.color = "#cccccc";
                    (e.currentTarget as HTMLAnchorElement).style.background = "#222222";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.color = "#888888";
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  }
                }}
              >
                <Icon size={14} />
                {item.label}
              </a>
            );
          })}

          {isAdmin && (
            <>
              <div className="px-4 mt-6 mb-2">
                <div className="ind-subtext" style={{ color: "#555555", fontSize: "0.55rem" }}>Administration</div>
              </div>
              {adminItems.map((item) => {
                const Icon = item.icon;
                const active = location === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.65rem 1.25rem",
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontSize: "0.72rem",
                      color: active ? "#ffffff" : "#666666",
                      textDecoration: "none",
                      borderLeft: `3px solid ${active ? "#ffffff" : "transparent"}`,
                      background: active ? "#2d2d2d" : "transparent",
                      transition: "all 0.1s ease",
                    }}
                  >
                    <Icon size={14} />
                    {item.label}
                  </a>
                );
              })}
            </>
          )}
        </nav>

        {/* User */}
        <div style={{ borderTop: "1px solid #2d2d2d", padding: "1rem 1.25rem" }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 flex items-center justify-center" style={{ background: "#2d2d2d", flexShrink: 0 }}>
              <span style={{ color: "#888888", fontSize: "0.65rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </span>
            </div>
            <div className="min-w-0">
              <div className="ind-label text-white truncate" style={{ fontSize: "0.65rem" }}>{user?.name ?? "User"}</div>
              {isAdmin && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Shield size={9} style={{ color: "#888888" }} />
                  <span className="ind-subtext" style={{ color: "#888888", fontSize: "0.5rem" }}>Admin</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              width: "100%",
              padding: "0.4rem 0.75rem",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontSize: "0.65rem",
              color: "#666666",
              background: "transparent",
              border: "1px solid #2d2d2d",
              cursor: "pointer",
              transition: "all 0.1s ease",
            }}
          >
            <LogOut size={11} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        {(title || subtitle) && (
          <div style={{ background: "#ffffff", borderBottom: "1px solid #e0e0e0", padding: "1.25rem 2rem" }}>
            {subtitle && <div className="ind-subtext text-gray-400 mb-1">{subtitle}</div>}
            {title && <h1 className="ind-headline" style={{ fontSize: "1.8rem", color: "#1a1a1a" }}>{title}</h1>}
          </div>
        )}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
