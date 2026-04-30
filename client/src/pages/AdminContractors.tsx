import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle, Clock, XCircle } from "lucide-react";

export default function AdminContractors() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && user?.role !== "admin") setLocation("/dashboard");
  }, [loading, user, setLocation]);

  const { data: contractors, refetch } = trpc.contractors.listAll.useQuery();

  const approveMutation = trpc.contractors.approve.useMutation({
    onSuccess: () => { refetch(); toast.success("Contractor approved"); },
  });

  const revokeMutation = trpc.contractors.revoke.useMutation({
    onSuccess: () => { refetch(); toast.success("Approval revoked"); },
  });

  const pending = contractors?.filter((c) => !c.isApproved) ?? [];
  const approved = contractors?.filter((c) => c.isApproved) ?? [];

  return (
    <AppLayout title="Contractors" subtitle="Administration">
      {/* Pending */}
      {pending.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="ind-label" style={{ fontSize: "0.75rem", color: "#1a1a1a" }}>Pending Approval</div>
            <span className="ind-flag-badge">{pending.length}</span>
          </div>
          <div style={{ background: "#ffffff", border: "2px solid #1a1a1a" }}>
            <table className="ind-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>CIDB Number</th>
                  <th>CIDB Grade</th>
                  <th>OGPC Number</th>
                  <th>OGPC Category</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="ind-label" style={{ fontSize: "0.8rem", color: "#1a1a1a" }}>{c.companyName}</div>
                      <div className="ind-subtext text-gray-400 mt-0.5">{c.user?.email ?? "—"}</div>
                    </td>
                    <td><span style={{ fontSize: "0.85rem" }}>{c.contactPerson ?? "—"}</span></td>
                    <td><span className="ind-mono text-gray-500">{c.cidbNumber ?? "—"}</span></td>
                    <td>
                      {c.cidbGrade ? (
                        <span className="ind-label" style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem", background: "#1a1a1a", color: "#ffffff" }}>{c.cidbGrade}</span>
                      ) : "—"}
                    </td>
                    <td><span className="ind-mono text-gray-500">{c.ogpcNumber ?? "—"}</span></td>
                    <td><span style={{ fontSize: "0.85rem" }}>{c.ogpcCategory ?? "—"}</span></td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => approveMutation.mutate({ id: c.id, approved: true })}
                        disabled={approveMutation.isPending}
                        className="flex items-center gap-1 ind-label px-3 py-1.5 mx-auto"
                        style={{ background: "#27ae60", color: "#ffffff", border: "none", fontSize: "0.6rem", cursor: "pointer" }}
                      >
                        <CheckCircle size={11} />
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approved */}
      <div>
        <div className="ind-label mb-4" style={{ fontSize: "0.75rem", color: "#1a1a1a" }}>
          Approved Contractors ({approved.length})
        </div>
        {approved.length === 0 ? (
          <div className="p-10 text-center" style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}>
            <div className="ind-label text-gray-400" style={{ fontSize: "0.75rem" }}>No approved contractors yet</div>
          </div>
        ) : (
          <div style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}>
            <table className="ind-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>CIDB</th>
                  <th>Grade</th>
                  <th>OGPC</th>
                  <th>Category</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {approved.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="ind-label" style={{ fontSize: "0.8rem", color: "#1a1a1a" }}>{c.companyName}</div>
                      <div className="ind-subtext text-gray-400 mt-0.5">{c.user?.email ?? "—"}</div>
                    </td>
                    <td><span style={{ fontSize: "0.85rem" }}>{c.contactPerson ?? "—"}</span></td>
                    <td><span className="ind-mono text-gray-500">{c.cidbNumber ?? "—"}</span></td>
                    <td>
                      {c.cidbGrade ? (
                        <span className="ind-label" style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem", background: "#1a1a1a", color: "#ffffff" }}>{c.cidbGrade}</span>
                      ) : "—"}
                    </td>
                    <td><span className="ind-mono text-gray-500">{c.ogpcNumber ?? "—"}</span></td>
                    <td><span style={{ fontSize: "0.85rem" }}>{c.ogpcCategory ?? "—"}</span></td>
                    <td style={{ textAlign: "center" }}>
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle size={12} style={{ color: "#27ae60" }} />
                        <span className="ind-label" style={{ fontSize: "0.6rem", color: "#27ae60" }}>Approved</span>
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => revokeMutation.mutate({ id: c.id })}
                        className="flex items-center gap-1 ind-label px-3 py-1.5 mx-auto"
                        style={{ background: "transparent", color: "#c0392b", border: "1px solid #c0392b", fontSize: "0.6rem", cursor: "pointer" }}
                      >
                        <XCircle size={11} />
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
