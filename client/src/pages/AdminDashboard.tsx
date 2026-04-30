import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { BarChart3, Building2, FileText, Settings } from "lucide-react";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      setLocation("/dashboard");
    }
  }, [loading, user, setLocation]);

  const { data: contractors } = trpc.contractors.listAll.useQuery();
  const { data: versions } = trpc.rateVersions.list.useQuery();
  const { data: publishedVersion } = trpc.rateVersions.getPublished.useQuery();

  const pendingContractors = contractors?.filter((c) => !c.isApproved).length ?? 0;
  const approvedContractors = contractors?.filter((c) => c.isApproved).length ?? 0;
  const totalVersions = versions?.length ?? 0;

  return (
    <AppLayout title="Admin Overview" subtitle="Administration">
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Contractors", value: contractors?.length ?? 0, icon: Building2, sub: `${approvedContractors} approved` },
          { label: "Pending Approval", value: pendingContractors, icon: FileText, sub: "awaiting review" },
          { label: "Rate Versions", value: totalVersions, icon: BarChart3, sub: "total versions" },
          { label: "Active Version", value: publishedVersion?.year ?? "—", icon: Settings, sub: publishedVersion?.label ?? "None published" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="p-5" style={{ background: "#ffffff", border: "1px solid #e0e0e0", boxShadow: "3px 3px 0 #e0e0e0" }}>
              <div className="flex items-start justify-between mb-3">
                <div className="ind-subtext text-gray-400">{stat.label}</div>
                <Icon size={14} style={{ color: "#999999" }} />
              </div>
              <div className="ind-headline" style={{ fontSize: "2rem", color: "#1a1a1a" }}>{stat.value}</div>
              <div className="ind-subtext text-gray-400 mt-1">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid #e8e8e8" }}>
            <div className="ind-label" style={{ fontSize: "0.72rem", color: "#1a1a1a" }}>Quick Actions</div>
          </div>
          <div className="p-5 space-y-3">
            {[
              { href: "/admin/rates", label: "Manage Rate Database", desc: "Add, edit, and publish rate items and versions" },
              { href: "/admin/contractors", label: "Manage Contractors", desc: "Review and approve contractor registrations" },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center justify-between p-4 hover:opacity-80 transition-opacity"
                style={{ background: "#1a1a1a", textDecoration: "none" }}
              >
                <div>
                  <div className="ind-label text-white" style={{ fontSize: "0.72rem" }}>{action.label}</div>
                  <div className="ind-subtext text-gray-500 mt-1">{action.desc}</div>
                </div>
                <span style={{ color: "#666666", fontSize: "1rem" }}>→</span>
              </a>
            ))}
          </div>
        </div>

        {/* Rate Versions */}
        <div style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid #e8e8e8" }}>
            <div className="ind-label" style={{ fontSize: "0.72rem", color: "#1a1a1a" }}>Rate Versions</div>
          </div>
          {!versions || versions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="ind-label text-gray-400 mb-1" style={{ fontSize: "0.7rem" }}>No versions yet</div>
              <a href="/admin/rates" className="ind-subtext" style={{ color: "#1a1a1a" }}>Create first version →</a>
            </div>
          ) : (
            <div>
              {versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <div>
                    <div className="ind-label" style={{ fontSize: "0.72rem", color: "#1a1a1a" }}>{v.label}</div>
                    <div className="ind-subtext text-gray-400 mt-0.5">Year {v.year}</div>
                  </div>
                  <span
                    className="ind-label"
                    style={{
                      fontSize: "0.6rem",
                      padding: "0.15rem 0.5rem",
                      background: v.status === "published" ? "#1a1a1a" : v.status === "draft" ? "#e8e8e8" : "#f0f0f0",
                      color: v.status === "published" ? "#ffffff" : "#666666",
                    }}
                  >
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
