import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle, Clock } from "lucide-react";

const CIDB_GRADES = ["G1", "G2", "G3", "G4", "G5", "G6", "G7"];
const OGPC_CATEGORIES = ["Category A", "Category B", "Category C", "Category D", "Category E"];

export default function ContractorProfile() {
  const { user } = useAuth();
  const { data: profile, isLoading, refetch } = trpc.contractors.getMyProfile.useQuery();
  const [form, setForm] = useState({
    companyName: "",
    cidbNumber: "",
    ogpcNumber: "",
    cidbGrade: "",
    ogpcCategory: "",
    contactPerson: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        companyName: profile.companyName ?? "",
        cidbNumber: profile.cidbNumber ?? "",
        ogpcNumber: profile.ogpcNumber ?? "",
        cidbGrade: profile.cidbGrade ?? "",
        ogpcCategory: profile.ogpcCategory ?? "",
        contactPerson: profile.contactPerson ?? "",
        phone: profile.phone ?? "",
        address: profile.address ?? "",
      });
    }
  }, [profile]);

  const upsertMutation = trpc.contractors.upsertProfile.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Profile saved successfully");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName.trim()) {
      toast.error("Company name is required");
      return;
    }
    upsertMutation.mutate(form);
  };

  const inputStyle = {
    width: "100%",
    border: "2px solid #e0e0e0",
    borderRadius: 0,
    padding: "0.6rem 0.75rem",
    fontFamily: "'Barlow', sans-serif",
    fontSize: "0.875rem",
    background: "white",
    outline: "none",
  };

  const selectStyle = {
    ...inputStyle,
    cursor: "pointer",
    appearance: "none" as const,
  };

  return (
    <AppLayout title="Contractor Profile" subtitle="CIDB / OGPC Credentials">
      <div className="max-w-3xl">
        {/* Status Banner */}
        {profile && (
          <div
            className="flex items-center gap-3 p-4 mb-6"
            style={{
              background: profile.isApproved ? "#f0faf4" : "#f8f8f8",
              border: `2px solid ${profile.isApproved ? "#27ae60" : "#e0e0e0"}`,
            }}
          >
            {profile.isApproved ? (
              <CheckCircle size={16} style={{ color: "#27ae60", flexShrink: 0 }} />
            ) : (
              <Clock size={16} style={{ color: "#999999", flexShrink: 0 }} />
            )}
            <div>
              <div className="ind-label" style={{ fontSize: "0.72rem", color: profile.isApproved ? "#27ae60" : "#666666" }}>
                {profile.isApproved ? "Profile Approved" : "Pending Approval"}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#666666" }}>
                {profile.isApproved
                  ? "Your contractor profile has been verified and approved."
                  : "Your profile is under review by an administrator."}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Account Info */}
          <div className="p-6 mb-4" style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}>
            <div className="ind-label mb-4" style={{ fontSize: "0.72rem", color: "#1a1a1a", borderBottom: "1px solid #e8e8e8", paddingBottom: "0.75rem" }}>
              Account Information
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="ind-label block mb-1.5" style={{ fontSize: "0.65rem", color: "#666666" }}>Name</label>
                <div className="p-2.5" style={{ background: "#f5f5f5", fontSize: "0.875rem", color: "#666666" }}>{user?.name ?? "—"}</div>
              </div>
              <div>
                <label className="ind-label block mb-1.5" style={{ fontSize: "0.65rem", color: "#666666" }}>Email</label>
                <div className="p-2.5" style={{ background: "#f5f5f5", fontSize: "0.875rem", color: "#666666" }}>{user?.email ?? "—"}</div>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="p-6 mb-4" style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}>
            <div className="ind-label mb-4" style={{ fontSize: "0.72rem", color: "#1a1a1a", borderBottom: "1px solid #e8e8e8", paddingBottom: "0.75rem" }}>
              Company Information
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="ind-label block mb-1.5" style={{ fontSize: "0.65rem", color: "#666666" }}>Company Name *</label>
                <input
                  type="text"
                  required
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="ind-label block mb-1.5" style={{ fontSize: "0.65rem", color: "#666666" }}>Contact Person</label>
                  <input
                    type="text"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                    onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                  />
                </div>
                <div>
                  <label className="ind-label block mb-1.5" style={{ fontSize: "0.65rem", color: "#666666" }}>Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                    onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                  />
                </div>
              </div>
              <div>
                <label className="ind-label block mb-1.5" style={{ fontSize: "0.65rem", color: "#666666" }}>Business Address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                  onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                />
              </div>
            </div>
          </div>

          {/* CIDB Credentials */}
          <div className="p-6 mb-4" style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}>
            <div className="flex items-center gap-3 mb-4" style={{ borderBottom: "1px solid #e8e8e8", paddingBottom: "0.75rem" }}>
              <div className="ind-label" style={{ fontSize: "0.72rem", color: "#1a1a1a" }}>CIDB Registration</div>
              <div className="ind-subtext text-gray-400">Construction Industry Development Board</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="ind-label block mb-1.5" style={{ fontSize: "0.65rem", color: "#666666" }}>CIDB Registration Number</label>
                <input
                  type="text"
                  placeholder="e.g. CIDB-2024-XXXXX"
                  value={form.cidbNumber}
                  onChange={(e) => setForm({ ...form, cidbNumber: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                />
              </div>
              <div>
                <label className="ind-label block mb-1.5" style={{ fontSize: "0.65rem", color: "#666666" }}>CIDB Grade</label>
                <select
                  value={form.cidbGrade}
                  onChange={(e) => setForm({ ...form, cidbGrade: e.target.value })}
                  style={selectStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                >
                  <option value="">Select Grade</option>
                  {CIDB_GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* OGPC Credentials */}
          <div className="p-6 mb-6" style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}>
            <div className="flex items-center gap-3 mb-4" style={{ borderBottom: "1px solid #e8e8e8", paddingBottom: "0.75rem" }}>
              <div className="ind-label" style={{ fontSize: "0.72rem", color: "#1a1a1a" }}>OGPC Registration</div>
              <div className="ind-subtext text-gray-400">Oil & Gas Pre-Qualification Committee</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="ind-label block mb-1.5" style={{ fontSize: "0.65rem", color: "#666666" }}>OGPC Registration Number</label>
                <input
                  type="text"
                  placeholder="e.g. OGPC-XXXXX"
                  value={form.ogpcNumber}
                  onChange={(e) => setForm({ ...form, ogpcNumber: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                />
              </div>
              <div>
                <label className="ind-label block mb-1.5" style={{ fontSize: "0.65rem", color: "#666666" }}>OGPC Category</label>
                <select
                  value={form.ogpcCategory}
                  onChange={(e) => setForm({ ...form, ogpcCategory: e.target.value })}
                  style={selectStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                >
                  <option value="">Select Category</option>
                  {OGPC_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={upsertMutation.isPending}
            className="ind-label px-8 py-3"
            style={{ background: "#1a1a1a", color: "#ffffff", border: "none", fontSize: "0.75rem", cursor: "pointer" }}
          >
            {upsertMutation.isPending ? "Saving..." : "Save Profile →"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
