import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { AlertTriangle, BookOpen, FileText, Plus, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: profile } = trpc.contractors.getMyProfile.useQuery();
  const { data: estimates } = trpc.boq.listMine.useQuery();
  const { data: publishedVersion } = trpc.rateVersions.getPublished.useQuery();
  const { data: categories } = trpc.rateCategories.list.useQuery();
  const { data: rateItemsData } = trpc.rateItems.list.useQuery({ limit: 1000 });

  const totalEstimates = estimates?.length ?? 0;
  const flaggedEstimates = estimates?.filter((e) => e.hasValidationFlags).length ?? 0;
  const draftEstimates = estimates?.filter((e) => e.status === "draft").length ?? 0;

  const createMutation = trpc.boq.create.useMutation({
    onSuccess: (data) => setLocation(`/boq/${data.id}`),
  });

  return (
    <AppLayout title="Dashboard" subtitle="Contractor Overview">
      {/* Profile Alert */}
      {!profile && (
        <div className="mb-6 p-4 flex items-center gap-4" style={{ background: "#1a1a1a", border: "1px solid #444444" }}>
          <AlertTriangle size={16} style={{ color: "#cccccc", flexShrink: 0 }} />
          <div className="flex-1">
            <div className="ind-label text-white" style={{ fontSize: "0.72rem" }}>Complete Your Profile</div>
            <div className="text-gray-400 mt-0.5" style={{ fontSize: "0.8rem" }}>Add your CIDB/OGPC credentials to access all platform features.</div>
          </div>
          <a
            href="/profile"
            className="ind-label px-4 py-2"
            style={{ background: "#ffffff", color: "#1a1a1a", textDecoration: "none", fontSize: "0.65rem", flexShrink: 0 }}
          >
            Set Up Profile →
          </a>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "My Estimates", value: totalEstimates, icon: FileText, sub: `${draftEstimates} draft` },
          { label: "Flagged Items", value: flaggedEstimates, icon: AlertTriangle, sub: "rate violations" },
          { label: "Rate Items", value: rateItemsData?.length ?? "—", icon: BookOpen, sub: publishedVersion?.label ?? "No active version" },
          { label: "Active Version", value: publishedVersion?.year ?? "—", icon: TrendingUp, sub: publishedVersion?.status ?? "Not published" },
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

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Estimates */}
        <div style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #e8e8e8" }}>
            <div className="ind-label" style={{ fontSize: "0.72rem", color: "#1a1a1a" }}>Recent Estimates</div>
            <button
              onClick={() => createMutation.mutate({ projectName: `Project ${new Date().toLocaleDateString("en-GB")}` })}
              disabled={createMutation.isPending}
              className="flex items-center gap-1 ind-label px-3 py-1.5"
              style={{ background: "#1a1a1a", color: "#ffffff", border: "none", fontSize: "0.65rem", cursor: "pointer" }}
            >
              <Plus size={11} />
              New BOQ
            </button>
          </div>
          {!estimates || estimates.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <FileText size={24} style={{ color: "#cccccc", margin: "0 auto 0.75rem" }} />
              <div className="ind-label text-gray-400" style={{ fontSize: "0.7rem" }}>No estimates yet</div>
              <div className="text-gray-400 mt-1" style={{ fontSize: "0.8rem" }}>Create your first BOQ estimate to get started.</div>
            </div>
          ) : (
            <div>
              {estimates.slice(0, 5).map((est) => (
                <a
                  key={est.id}
                  href={`/boq/${est.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                  style={{ borderBottom: "1px solid #f0f0f0", textDecoration: "none" }}
                >
                  <div>
                    <div className="ind-label" style={{ fontSize: "0.72rem", color: "#1a1a1a" }}>{est.projectName}</div>
                    <div className="ind-subtext text-gray-400 mt-0.5">{est.projectRef ?? "No ref"}</div>
                  </div>
                  <div className="text-right">
                    <div className="ind-mono" style={{ color: "#1a1a1a" }}>BND {parseFloat(est.grandTotal as string).toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                    <div className="flex items-center gap-2 mt-1 justify-end">
                      {est.hasValidationFlags && (
                        <span className="ind-flag-badge" style={{ fontSize: "0.55rem" }}>⚠ Flagged</span>
                      )}
                      <span
                        className="ind-label"
                        style={{
                          fontSize: "0.6rem",
                          padding: "0.1rem 0.4rem",
                          background: est.status === "draft" ? "#e8e8e8" : est.status === "submitted" ? "#1a1a1a" : "#27ae60",
                          color: est.status === "draft" ? "#666666" : "#ffffff",
                        }}
                      >
                        {est.status}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
              {estimates.length > 5 && (
                <a href="/boq" className="block px-5 py-3 ind-subtext text-gray-400 hover:text-gray-600 transition-colors" style={{ textDecoration: "none" }}>
                  View all {estimates.length} estimates →
                </a>
              )}
            </div>
          )}
        </div>

        {/* Rate Categories */}
        <div style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid #e8e8e8" }}>
            <div className="ind-label" style={{ fontSize: "0.72rem", color: "#1a1a1a" }}>Rate Categories</div>
          </div>
          <div className="p-5">
            {[
              { trade: "civil", label: "Civil Engineering", color: "#1a1a1a" },
              { trade: "mechanical", label: "Mechanical Engineering", color: "#2d2d2d" },
              { trade: "electrical", label: "Electrical Engineering", color: "#444444" },
              { trade: "piping", label: "Piping Engineering", color: "#666666" },
            ].map((t) => {
              const count = categories?.filter((c) => c.trade === t.trade).length ?? 0;
              return (
                <a
                  key={t.trade}
                  href={`/rates?trade=${t.trade}`}
                  className="flex items-center gap-3 p-3 mb-2 hover:opacity-80 transition-opacity"
                  style={{ background: t.color, textDecoration: "none" }}
                >
                  <div className="flex-1">
                    <div className="ind-label text-white" style={{ fontSize: "0.72rem" }}>{t.label}</div>
                    <div className="ind-subtext text-gray-400 mt-0.5">{count} categories</div>
                  </div>
                  <div className="ind-subtext text-gray-500 uppercase">{t.trade.slice(0, 3)}</div>
                </a>
              );
            })}
          </div>
          <div className="px-5 pb-4">
            <a
              href="/rates"
              className="ind-label block text-center py-2.5"
              style={{ background: "#f0f0f0", color: "#1a1a1a", textDecoration: "none", fontSize: "0.65rem" }}
            >
              Browse All Rates →
            </a>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
