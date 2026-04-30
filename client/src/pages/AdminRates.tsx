import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, Edit, Plus, Trash2, X } from "lucide-react";

const TRADES = ["civil", "mechanical", "electrical", "piping"] as const;

export default function AdminRates() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && user?.role !== "admin") setLocation("/dashboard");
  }, [loading, user, setLocation]);

  const utils = trpc.useUtils();
  const { data: versions, refetch: refetchVersions } = trpc.rateVersions.list.useQuery();
  const { data: categories, refetch: refetchCats } = trpc.rateCategories.list.useQuery();
  const [selectedVersionId, setSelectedVersionId] = useState<number | undefined>();
  const [selectedTrade, setSelectedTrade] = useState<string>("civil");
  const [showNewVersion, setShowNewVersion] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewItem, setShowNewItem] = useState(false);
  const [editItem, setEditItem] = useState<number | null>(null);

  const [versionForm, setVersionForm] = useState({ year: new Date().getFullYear(), label: "" });
  const [catForm, setCatForm] = useState({ name: "", trade: "civil", code: "" });
  const [itemForm, setItemForm] = useState({
    code: "", description: "", unit: "", categoryId: 0,
    rateMin: "", rateStandard: "", rateMax: "", remarks: "",
  });

  const selectedTradeEnum = selectedTrade as "civil" | "mechanical" | "electrical" | "piping";
  const { data: items, refetch: refetchItems } = trpc.rateItems.list.useQuery({
    versionId: selectedVersionId,
    trade: selectedTradeEnum,
    limit: 500,
  });

  const createVersionMutation = trpc.rateVersions.create.useMutation({
    onSuccess: (v) => {
      refetchVersions();
      setSelectedVersionId(v.id);
      setShowNewVersion(false);
      toast.success("Rate version created");
    },
  });

  const publishVersionMutation = trpc.rateVersions.publish.useMutation({
    onSuccess: () => { refetchVersions(); toast.success("Version published — now active"); },
  });

  const createCatMutation = trpc.rateCategories.create.useMutation({
    onSuccess: () => { refetchCats(); setShowNewCategory(false); setCatForm({ name: "", trade: "civil", code: "" }); toast.success("Category created"); },
  });

  const createItemMutation = trpc.rateItems.create.useMutation({
    onSuccess: () => { refetchItems(); setShowNewItem(false); setItemForm({ code: "", description: "", unit: "", categoryId: 0, rateMin: "", rateStandard: "", rateMax: "", remarks: "" }); toast.success("Rate item added"); },
    onError: (e) => toast.error(e.message),
  });

  const updateItemMutation = trpc.rateItems.update.useMutation({
    onSuccess: () => { refetchItems(); setEditItem(null); toast.success("Rate item updated"); },
  });

  const deleteItemMutation = trpc.rateItems.delete.useMutation({
    onSuccess: () => { refetchItems(); toast.success("Rate item deleted"); },
  });

  const filteredCats = categories?.filter((c) => c.trade === selectedTrade) ?? [];

  const inputStyle = {
    width: "100%", border: "2px solid #e0e0e0", borderRadius: 0,
    padding: "0.5rem 0.75rem", fontFamily: "'Barlow', sans-serif",
    fontSize: "0.875rem", background: "white", outline: "none",
  };

  return (
    <AppLayout title="Manage Rates" subtitle="Administration">
      <div className="flex gap-6">
        {/* Left: Versions */}
        <div style={{ width: "220px", flexShrink: 0 }}>
          <div className="flex items-center justify-between mb-3">
            <div className="ind-label" style={{ fontSize: "0.65rem", color: "#999999" }}>Rate Versions</div>
            <button onClick={() => setShowNewVersion(true)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#999999" }}>
              <Plus size={13} />
            </button>
          </div>

          {showNewVersion && (
            <div className="p-3 mb-3" style={{ background: "#ffffff", border: "2px solid #1a1a1a" }}>
              <div className="space-y-2 mb-3">
                <input type="number" placeholder="Year (e.g. 2025)" value={versionForm.year} onChange={(e) => setVersionForm({ ...versionForm, year: parseInt(e.target.value) })}
                  style={{ ...inputStyle, fontSize: "0.8rem", padding: "0.4rem 0.6rem" }} />
                <input type="text" placeholder="Label (e.g. BOGSA 2025)" value={versionForm.label} onChange={(e) => setVersionForm({ ...versionForm, label: e.target.value })}
                  style={{ ...inputStyle, fontSize: "0.8rem", padding: "0.4rem 0.6rem" }} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => createVersionMutation.mutate(versionForm)} disabled={createVersionMutation.isPending}
                  style={{ flex: 1, background: "#1a1a1a", color: "#ffffff", border: "none", padding: "0.4rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
                  Create
                </button>
                <button onClick={() => setShowNewVersion(false)} style={{ background: "transparent", border: "1px solid #e0e0e0", padding: "0.4rem 0.5rem", cursor: "pointer", color: "#999999" }}>
                  <X size={11} />
                </button>
              </div>
            </div>
          )}

          {versions?.map((v) => (
            <div key={v.id}
              onClick={() => setSelectedVersionId(v.id)}
              style={{
                padding: "0.6rem 0.75rem", marginBottom: "0.25rem", cursor: "pointer",
                background: selectedVersionId === v.id ? "#1a1a1a" : "#ffffff",
                border: `1px solid ${selectedVersionId === v.id ? "#1a1a1a" : "#e0e0e0"}`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="ind-label" style={{ fontSize: "0.7rem", color: selectedVersionId === v.id ? "#ffffff" : "#1a1a1a" }}>{v.label}</div>
                {v.status === "published" && <CheckCircle size={11} style={{ color: selectedVersionId === v.id ? "#aaaaaa" : "#27ae60" }} />}
              </div>
              <div className="ind-subtext mt-0.5" style={{ color: selectedVersionId === v.id ? "#888888" : "#999999" }}>{v.status}</div>
              {selectedVersionId === v.id && v.status !== "published" && (
                <button
                  onClick={(e) => { e.stopPropagation(); publishVersionMutation.mutate({ id: v.id }); }}
                  style={{ marginTop: "0.5rem", width: "100%", background: "#ffffff", color: "#1a1a1a", border: "none", padding: "0.3rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}
                >
                  Publish Version
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Right: Items */}
        <div className="flex-1 min-w-0">
          {/* Trade tabs */}
          <div className="flex mb-4">
            {TRADES.map((t) => (
              <button key={t} onClick={() => setSelectedTrade(t)}
                style={{
                  padding: "0.5rem 1rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.7rem",
                  background: selectedTrade === t ? "#1a1a1a" : "#ffffff",
                  color: selectedTrade === t ? "#ffffff" : "#666666",
                  border: "2px solid", borderColor: selectedTrade === t ? "#1a1a1a" : "#e0e0e0",
                  borderRight: t !== "piping" ? "none" : "2px solid", cursor: "pointer",
                }}
              >
                {t}
              </button>
            ))}
            <div className="flex-1" />
            <button onClick={() => setShowNewCategory(true)}
              className="flex items-center gap-1 ind-label px-3 py-1.5 ml-2"
              style={{ background: "#f0f0f0", color: "#1a1a1a", border: "1px solid #e0e0e0", fontSize: "0.65rem", cursor: "pointer" }}>
              <Plus size={11} /> Category
            </button>
            {selectedVersionId && (
              <button onClick={() => setShowNewItem(true)}
                className="flex items-center gap-1 ind-label px-3 py-1.5 ml-2"
                style={{ background: "#1a1a1a", color: "#ffffff", border: "none", fontSize: "0.65rem", cursor: "pointer" }}>
                <Plus size={11} /> Rate Item
              </button>
            )}
          </div>

          {/* New Category */}
          {showNewCategory && (
            <div className="p-4 mb-4" style={{ background: "#ffffff", border: "2px solid #1a1a1a" }}>
              <div className="ind-label mb-3" style={{ fontSize: "0.7rem" }}>New Category</div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <input type="text" placeholder="Category Name" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} style={{ ...inputStyle, fontSize: "0.8rem" }} />
                <input type="text" placeholder="Code (e.g. CIV-01)" value={catForm.code} onChange={(e) => setCatForm({ ...catForm, code: e.target.value })} style={{ ...inputStyle, fontSize: "0.8rem" }} />
                <select value={catForm.trade} onChange={(e) => setCatForm({ ...catForm, trade: e.target.value })} style={{ ...inputStyle, fontSize: "0.8rem" }}>
                  {TRADES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => createCatMutation.mutate({ ...catForm, trade: catForm.trade as "civil" | "mechanical" | "electrical" | "piping" })} style={{ background: "#1a1a1a", color: "#ffffff", border: "none", padding: "0.4rem 1rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Create</button>
                <button onClick={() => setShowNewCategory(false)} style={{ background: "transparent", border: "1px solid #e0e0e0", padding: "0.4rem 0.6rem", cursor: "pointer", color: "#999999" }}><X size={11} /></button>
              </div>
            </div>
          )}

          {/* New Item */}
          {showNewItem && selectedVersionId && (
            <div className="p-4 mb-4" style={{ background: "#ffffff", border: "2px solid #1a1a1a" }}>
              <div className="ind-label mb-3" style={{ fontSize: "0.7rem" }}>New Rate Item</div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <input type="text" placeholder="Item Code (e.g. CIV-EW-001)" value={itemForm.code} onChange={(e) => setItemForm({ ...itemForm, code: e.target.value })} style={{ ...inputStyle, fontSize: "0.8rem" }} />
                <div className="col-span-2">
                  <input type="text" placeholder="Description" value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} style={{ ...inputStyle, fontSize: "0.8rem" }} />
                </div>
                <div>
                  <select value={itemForm.categoryId} onChange={(e) => setItemForm({ ...itemForm, categoryId: parseInt(e.target.value) })} style={{ ...inputStyle, fontSize: "0.8rem" }}>
                    <option value={0}>Select Category</option>
                    {filteredCats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <input type="text" placeholder="Unit (m, m², m³, nr, ls, kg...)" value={itemForm.unit} onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })} style={{ ...inputStyle, fontSize: "0.8rem" }} />
                <input type="text" placeholder="Remarks (optional)" value={itemForm.remarks} onChange={(e) => setItemForm({ ...itemForm, remarks: e.target.value })} style={{ ...inputStyle, fontSize: "0.8rem" }} />
                <input type="number" placeholder="Min Rate (BND)" value={itemForm.rateMin} onChange={(e) => setItemForm({ ...itemForm, rateMin: e.target.value })} style={{ ...inputStyle, fontSize: "0.8rem" }} />
                <input type="number" placeholder="Standard Rate (BND)" value={itemForm.rateStandard} onChange={(e) => setItemForm({ ...itemForm, rateStandard: e.target.value })} style={{ ...inputStyle, fontSize: "0.8rem" }} />
                <input type="number" placeholder="Max Rate (BND)" value={itemForm.rateMax} onChange={(e) => setItemForm({ ...itemForm, rateMax: e.target.value })} style={{ ...inputStyle, fontSize: "0.8rem" }} />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => createItemMutation.mutate({ ...itemForm, versionId: selectedVersionId })}
                  disabled={createItemMutation.isPending}
                  style={{ background: "#1a1a1a", color: "#ffffff", border: "none", padding: "0.4rem 1rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}
                >
                  {createItemMutation.isPending ? "Adding..." : "Add Item"}
                </button>
                <button onClick={() => setShowNewItem(false)} style={{ background: "transparent", border: "1px solid #e0e0e0", padding: "0.4rem 0.6rem", cursor: "pointer", color: "#999999" }}><X size={11} /></button>
              </div>
            </div>
          )}

          {/* Items Table */}
          {!selectedVersionId ? (
            <div className="p-10 text-center" style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}>
              <div className="ind-label text-gray-400 mb-1" style={{ fontSize: "0.75rem" }}>Select a Rate Version</div>
              <div className="text-gray-400" style={{ fontSize: "0.85rem" }}>Choose a version from the left panel to manage its rate items.</div>
            </div>
          ) : (
            <div style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #e8e8e8" }}>
                <div className="ind-subtext text-gray-400">{items?.length ?? 0} items in {selectedTrade}</div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="ind-table">
                  <thead>
                    <tr>
                      <th style={{ width: "100px" }}>Code</th>
                      <th>Description</th>
                      <th style={{ width: "80px" }}>Category</th>
                      <th style={{ width: "55px" }}>Unit</th>
                      <th style={{ width: "90px", textAlign: "right" }}>Min</th>
                      <th style={{ width: "100px", textAlign: "right" }}>Standard</th>
                      <th style={{ width: "90px", textAlign: "right" }}>Max</th>
                      <th style={{ width: "70px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items?.map((item) => (
                      <tr key={item.id}>
                        <td><span className="ind-mono text-gray-500">{item.code}</span></td>
                        <td style={{ fontSize: "0.85rem" }}>{item.description}</td>
                        <td><span className="ind-subtext text-gray-400">{item.category?.name ?? "—"}</span></td>
                        <td><span className="ind-mono text-gray-500">{item.unit}</span></td>
                        <td style={{ textAlign: "right" }}><span className="ind-mono">{parseFloat(item.rateMin as string).toFixed(2)}</span></td>
                        <td style={{ textAlign: "right" }}><span className="ind-mono font-bold">{parseFloat(item.rateStandard as string).toFixed(2)}</span></td>
                        <td style={{ textAlign: "right" }}><span className="ind-mono">{parseFloat(item.rateMax as string).toFixed(2)}</span></td>
                        <td>
                          <div className="flex gap-1">
                            <button onClick={() => deleteItemMutation.mutate({ id: item.id })} style={{ background: "transparent", border: "none", color: "#cccccc", cursor: "pointer", padding: "0.2rem" }}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
