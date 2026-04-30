import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function BOQEstimator() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { data: estimates, isLoading } = trpc.boq.listMine.useQuery();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ projectName: "", projectLocation: "", clientName: "", projectRef: "", description: "" });

  const createMutation = trpc.boq.create.useMutation({
    onSuccess: (data) => {
      setLocation(`/boq/${data.id}`);
      toast.success("BOQ estimate created");
    },
    onError: () => toast.error("Failed to create estimate"),
  });

  const deleteMutation = trpc.boq.delete.useMutation({
    onSuccess: () => {
      utils.boq.listMine.invalidate();
      toast.success("Estimate deleted");
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectName.trim()) return;
    createMutation.mutate(form);
  };

  return (
    <AppLayout title="BOQ Estimator" subtitle="Bill of Quantities">
      <div className="flex items-center justify-between mb-6">
        <div className="ind-subtext text-gray-400">{estimates?.length ?? 0} estimates</div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 ind-label px-4 py-2.5"
          style={{ background: "#1a1a1a", color: "#ffffff", border: "none", fontSize: "0.7rem", cursor: "pointer" }}
        >
          <Plus size={13} />
          New Estimate
        </button>
      </div>

      {/* New Estimate Form */}
      {showNew && (
        <div className="mb-6 p-6" style={{ background: "#ffffff", border: "2px solid #1a1a1a" }}>
          <div className="ind-label mb-4" style={{ fontSize: "0.75rem", color: "#1a1a1a" }}>New BOQ Estimate</div>
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="ind-label block mb-1.5" style={{ fontSize: "0.65rem", color: "#666666" }}>Project Name *</label>
                <input
                  type="text"
                  required
                  value={form.projectName}
                  onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                  style={{ width: "100%", border: "2px solid #e0e0e0", borderRadius: 0, padding: "0.5rem 0.75rem", fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", outline: "none" }}
                  onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                />
              </div>
              <div>
                <label className="ind-label block mb-1.5" style={{ fontSize: "0.65rem", color: "#666666" }}>Project Reference</label>
                <input
                  type="text"
                  value={form.projectRef}
                  onChange={(e) => setForm({ ...form, projectRef: e.target.value })}
                  style={{ width: "100%", border: "2px solid #e0e0e0", borderRadius: 0, padding: "0.5rem 0.75rem", fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", outline: "none" }}
                  onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                />
              </div>
              <div>
                <label className="ind-label block mb-1.5" style={{ fontSize: "0.65rem", color: "#666666" }}>Client Name</label>
                <input
                  type="text"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  style={{ width: "100%", border: "2px solid #e0e0e0", borderRadius: 0, padding: "0.5rem 0.75rem", fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", outline: "none" }}
                  onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                />
              </div>
              <div>
                <label className="ind-label block mb-1.5" style={{ fontSize: "0.65rem", color: "#666666" }}>Project Location</label>
                <input
                  type="text"
                  value={form.projectLocation}
                  onChange={(e) => setForm({ ...form, projectLocation: e.target.value })}
                  style={{ width: "100%", border: "2px solid #e0e0e0", borderRadius: 0, padding: "0.5rem 0.75rem", fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", outline: "none" }}
                  onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="ind-label px-6 py-2.5"
                style={{ background: "#1a1a1a", color: "#ffffff", border: "none", fontSize: "0.7rem", cursor: "pointer" }}
              >
                {createMutation.isPending ? "Creating..." : "Create Estimate →"}
              </button>
              <button
                type="button"
                onClick={() => setShowNew(false)}
                className="ind-label px-6 py-2.5"
                style={{ background: "transparent", color: "#666666", border: "2px solid #e0e0e0", fontSize: "0.7rem", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Estimates List */}
      {isLoading ? (
        <div className="p-10 text-center" style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}>
          <div className="ind-subtext text-gray-400">Loading estimates...</div>
        </div>
      ) : !estimates || estimates.length === 0 ? (
        <div className="p-16 text-center" style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}>
          <FileText size={32} style={{ color: "#cccccc", margin: "0 auto 1rem" }} />
          <div className="ind-label text-gray-400 mb-2" style={{ fontSize: "0.75rem" }}>No Estimates Yet</div>
          <div className="text-gray-400 mb-6" style={{ fontSize: "0.9rem" }}>Create your first BOQ estimate to start building your bill of quantities.</div>
          <button
            onClick={() => setShowNew(true)}
            className="ind-label px-6 py-3"
            style={{ background: "#1a1a1a", color: "#ffffff", border: "none", fontSize: "0.7rem", cursor: "pointer" }}
          >
            Create First Estimate →
          </button>
        </div>
      ) : (
        <div style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}>
          <table className="ind-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Reference</th>
                <th>Client</th>
                <th>Location</th>
                <th style={{ textAlign: "right" }}>Grand Total (BND)</th>
                <th style={{ textAlign: "center" }}>Status</th>
                <th style={{ textAlign: "center" }}>Flags</th>
                <th style={{ width: "80px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {estimates.map((est) => (
                <tr key={est.id} style={{ cursor: "pointer" }} onClick={() => setLocation(`/boq/${est.id}`)}>
                  <td>
                    <div className="ind-label" style={{ fontSize: "0.8rem", color: "#1a1a1a" }}>{est.projectName}</div>
                    <div className="ind-subtext text-gray-400 mt-0.5">{new Date(est.createdAt).toLocaleDateString("en-GB")}</div>
                  </td>
                  <td><span className="ind-mono text-gray-500">{est.projectRef ?? "—"}</span></td>
                  <td><span style={{ fontSize: "0.85rem" }}>{est.clientName ?? "—"}</span></td>
                  <td><span style={{ fontSize: "0.85rem" }}>{est.projectLocation ?? "—"}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <span className="ind-mono font-bold">
                      {parseFloat(est.grandTotal as string).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      className="ind-label"
                      style={{
                        fontSize: "0.6rem",
                        padding: "0.15rem 0.5rem",
                        background: est.status === "draft" ? "#e8e8e8" : est.status === "submitted" ? "#1a1a1a" : "#27ae60",
                        color: est.status === "draft" ? "#666666" : "#ffffff",
                      }}
                    >
                      {est.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {est.hasValidationFlags ? (
                      <div className="flex items-center justify-center gap-1">
                        <AlertTriangle size={12} style={{ color: "#c0392b" }} />
                        <span className="ind-flag-badge" style={{ fontSize: "0.55rem" }}>Flagged</span>
                      </div>
                    ) : (
                      <span className="ind-label" style={{ fontSize: "0.6rem", color: "#27ae60" }}>✓ OK</span>
                    )}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        if (confirm("Delete this estimate?")) deleteMutation.mutate({ id: est.id });
                      }}
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "#cccccc", padding: "0.25rem" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
