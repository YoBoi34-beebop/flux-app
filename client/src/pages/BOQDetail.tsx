import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { useDebounce } from "@/hooks/useDebounce";
import { AlertTriangle, Bot, Download, Plus, Search, Trash2, X } from "lucide-react";
import { useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";

type RateItem = {
  id: number;
  code: string;
  description: string;
  unit: string;
  rateStandard: string | number;
  rateMin: string | number;
  rateMax: string | number;
  category?: { trade?: string } | null;
};

export default function BOQDetail() {
  const { id } = useParams<{ id: string }>();
  const estimateId = parseInt(id ?? "0");
  const [, setLocation] = useLocation();

  const [showAddItem, setShowAddItem] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiScope, setAiScope] = useState("");
  const [rateSearch, setRateSearch] = useState("");
  const [selectedRate, setSelectedRate] = useState<RateItem | null>(null);
  const [lineForm, setLineForm] = useState({ quantity: "1", unitRate: "" });
  const [editingLine, setEditingLine] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({ quantity: "", unitRate: "" });

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.boq.getById.useQuery({ id: estimateId });
  const debouncedSearch = useDebounce(rateSearch, 300);
  const { data: rateItems } = trpc.rateItems.list.useQuery({ search: debouncedSearch || undefined, limit: 50 });
  const aiMutation = trpc.ai.suggestRateItems.useMutation();

  const addLineMutation = trpc.boq.addLineItem.useMutation({
    onSuccess: () => {
      utils.boq.getById.invalidate({ id: estimateId });
      setShowAddItem(false);
      setSelectedRate(null);
      setLineForm({ quantity: "1", unitRate: "" });
      setRateSearch("");
      toast.success("Line item added");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateLineMutation = trpc.boq.updateLineItem.useMutation({
    onSuccess: () => {
      utils.boq.getById.invalidate({ id: estimateId });
      setEditingLine(null);
      toast.success("Line item updated");
    },
    onError: (e) => toast.error(e.message),
  });

  const removeLineMutation = trpc.boq.removeLineItem.useMutation({
    onSuccess: () => {
      utils.boq.getById.invalidate({ id: estimateId });
      toast.success("Line item removed");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateEstimateMutation = trpc.boq.update.useMutation({
    onSuccess: () => { utils.boq.getById.invalidate({ id: estimateId }); toast.success("Estimate updated"); },
    onError: (e) => toast.error(e.message),
  });

  const handleSelectRate = useCallback((item: RateItem) => {
    setSelectedRate(item);
    setLineForm({ quantity: "1", unitRate: String(parseFloat(String(item.rateStandard)).toFixed(2)) });
  }, []);

  const handleAddLine = () => {
    if (!selectedRate) return;
    addLineMutation.mutate({
      estimateId,
      rateItemId: selectedRate.id,
      itemCode: selectedRate.code,
      description: selectedRate.description,
      unit: selectedRate.unit,
      quantity: lineForm.quantity,
      unitRate: lineForm.unitRate,
      rateMin: String(selectedRate.rateMin),
      rateMax: String(selectedRate.rateMax),
    });
  };

  const handleExportPDF = async () => {
    toast.info("Generating PDF...");
    try {
      const response = await fetch(`/api/boq/${estimateId}/pdf`, { credentials: "include" });
      if (!response.ok) throw new Error("PDF generation failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BOQ-${data?.estimate.projectRef ?? estimateId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch {
      toast.error("PDF export failed. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Loading..." subtitle="BOQ Estimate">
        <div className="p-10 text-center ind-subtext text-gray-400">Loading estimate...</div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout title="Not Found" subtitle="BOQ Estimate">
        <div className="p-10 text-center">
          <div className="ind-label text-gray-400 mb-2">Estimate not found</div>
          <a href="/boq" className="ind-label" style={{ color: "#1a1a1a" }}>← Back to Estimates</a>
        </div>
      </AppLayout>
    );
  }

  const { estimate, lineItems } = data;
  const flaggedCount = lineItems.filter((l) => l.isFlagged).length;

  return (
    <AppLayout title={estimate.projectName} subtitle="BOQ Estimate">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <a href="/boq" className="ind-subtext text-gray-400 hover:text-gray-600" style={{ textDecoration: "none" }}>← Estimates</a>
          <div className="flex items-center gap-2">
            {estimate.projectRef && <span className="ind-mono text-gray-500">{estimate.projectRef}</span>}
            <span
              className="ind-label"
              style={{
                fontSize: "0.6rem",
                padding: "0.15rem 0.5rem",
                background: estimate.status === "draft" ? "#e8e8e8" : "#1a1a1a",
                color: estimate.status === "draft" ? "#666666" : "#ffffff",
              }}
            >
              {estimate.status}
            </span>
            {flaggedCount > 0 && (
              <span className="ind-flag-badge flex items-center gap-1">
                <AlertTriangle size={9} /> {flaggedCount} flagged
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAI(!showAI)}
            className="flex items-center gap-2 ind-label px-4 py-2.5"
            style={{ background: showAI ? "#1a1a1a" : "#f0f0f0", color: showAI ? "#ffffff" : "#1a1a1a", border: "2px solid #1a1a1a", fontSize: "0.7rem", cursor: "pointer" }}
          >
            <Bot size={13} />
            AI Assistant
          </button>
          <button
            onClick={() => setShowAddItem(!showAddItem)}
            className="flex items-center gap-2 ind-label px-4 py-2.5"
            style={{ background: "#1a1a1a", color: "#ffffff", border: "none", fontSize: "0.7rem", cursor: "pointer" }}
          >
            <Plus size={13} />
            Add Rate Item
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 ind-label px-4 py-2.5"
            style={{ background: "transparent", color: "#1a1a1a", border: "2px solid #1a1a1a", fontSize: "0.7rem", cursor: "pointer" }}
          >
            <Download size={13} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Project Info */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Client", value: estimate.clientName ?? "—" },
          { label: "Location", value: estimate.projectLocation ?? "—" },
          { label: "Reference", value: estimate.projectRef ?? "—" },
          { label: "Grand Total (BND)", value: parseFloat(estimate.grandTotal as string).toLocaleString("en-US", { minimumFractionDigits: 2 }), mono: true, large: true },
        ].map((f) => (
          <div key={f.label} className="p-4" style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}>
            <div className="ind-subtext text-gray-400 mb-1">{f.label}</div>
            <div className={f.mono ? "ind-mono font-bold" : ""} style={{ fontSize: f.large ? "1.1rem" : "0.9rem", color: "#1a1a1a" }}>{f.value}</div>
          </div>
        ))}
      </div>

      {/* AI Assistant Panel */}
      {showAI && (
        <div className="mb-6 p-5" style={{ background: "#1a1a1a", border: "2px solid #444444" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bot size={16} style={{ color: "#cccccc" }} />
              <div className="ind-label text-white" style={{ fontSize: "0.75rem" }}>AI Rate Assistant</div>
            </div>
            <button onClick={() => setShowAI(false)} style={{ background: "transparent", border: "none", color: "#666666", cursor: "pointer" }}>
              <X size={14} />
            </button>
          </div>
          <div className="ind-subtext text-gray-500 mb-3">Describe your work scope in plain English to find matching BOGSA rate items.</div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. Install 6-inch carbon steel piping with flanged connections and pressure testing..."
              value={aiScope}
              onChange={(e) => setAiScope(e.target.value)}
              style={{ flex: 1, border: "2px solid #444444", borderRadius: 0, padding: "0.6rem 0.75rem", fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", background: "#2d2d2d", color: "#ffffff", outline: "none" }}
              onFocus={(e) => (e.target.style.borderColor = "#888888")}
              onBlur={(e) => (e.target.style.borderColor = "#444444")}
            />
            <button
              onClick={() => aiMutation.mutate({ scopeDescription: aiScope })}
              disabled={aiMutation.isPending || !aiScope.trim()}
              className="ind-label px-5 py-2.5"
              style={{ background: "#ffffff", color: "#1a1a1a", border: "none", fontSize: "0.7rem", cursor: "pointer" }}
            >
              {aiMutation.isPending ? "Searching..." : "Find Rates →"}
            </button>
          </div>
          {aiMutation.data && aiMutation.data.length > 0 && (
            <div className="mt-4">
              <div className="ind-subtext text-gray-500 mb-2">{aiMutation.data.length} matching rate items found:</div>
              <div className="space-y-2">
                {aiMutation.data.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3" style={{ background: "#2d2d2d", border: "1px solid #444444" }}>
                    <div>
                      <span className="ind-mono text-gray-400 mr-2">{item.code}</span>
                      <span className="text-white" style={{ fontSize: "0.85rem" }}>{item.description}</span>
                      <span className="ind-subtext text-gray-500 ml-3">{item.unit}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="ind-mono text-gray-300">BND {parseFloat(String(item.rateStandard)).toFixed(2)}</span>
                      <button
                        onClick={() => {
                          handleSelectRate(item as RateItem);
                          setShowAddItem(true);
                          setShowAI(false);
                        }}
                        className="ind-label px-3 py-1.5"
                        style={{ background: "#ffffff", color: "#1a1a1a", border: "none", fontSize: "0.6rem", cursor: "pointer" }}
                      >
                        Add to BOQ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {aiMutation.data && aiMutation.data.length === 0 && (
            <div className="mt-3 ind-subtext text-gray-500">No matching rate items found. Try a different description.</div>
          )}
        </div>
      )}

      {/* Add Item Panel */}
      {showAddItem && (
        <div className="mb-6 p-5" style={{ background: "#ffffff", border: "2px solid #1a1a1a" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="ind-label" style={{ fontSize: "0.75rem", color: "#1a1a1a" }}>Add Rate Item to BOQ</div>
            <button onClick={() => { setShowAddItem(false); setSelectedRate(null); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#999999" }}>
              <X size={14} />
            </button>
          </div>

          {!selectedRate ? (
            <div>
              <div className="relative mb-3">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#999999" }} />
                <input
                  type="text"
                  placeholder="Search rate items..."
                  value={rateSearch}
                  onChange={(e) => setRateSearch(e.target.value)}
                  style={{ width: "100%", border: "2px solid #e0e0e0", borderRadius: 0, padding: "0.5rem 0.75rem 0.5rem 2.25rem", fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", outline: "none" }}
                  onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                />
              </div>
              <div style={{ maxHeight: "240px", overflowY: "auto", border: "1px solid #e0e0e0" }}>
                {rateItems?.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectRate(item as RateItem)}
                    className="w-full text-left flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                    style={{ border: "none", borderBottom: "1px solid #f0f0f0", background: "transparent", cursor: "pointer" }}
                  >
                    <div>
                      <span className="ind-mono text-gray-400 mr-2" style={{ fontSize: "0.75rem" }}>{item.code}</span>
                      <span style={{ fontSize: "0.85rem", color: "#1a1a1a" }}>{item.description}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`trade-badge trade-${item.category?.trade ?? "civil"}`}>{item.category?.trade}</span>
                      <span className="ind-mono text-gray-500">{item.unit}</span>
                      <span className="ind-mono font-bold">BND {parseFloat(String(item.rateStandard)).toFixed(2)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="p-3 mb-4 flex items-center justify-between" style={{ background: "#f0f0f0" }}>
                <div>
                  <span className="ind-mono text-gray-500 mr-2">{selectedRate.code}</span>
                  <span className="ind-label" style={{ fontSize: "0.8rem" }}>{selectedRate.description}</span>
                </div>
                <button onClick={() => setSelectedRate(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#999999" }}>
                  <X size={12} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="ind-label block mb-1.5" style={{ fontSize: "0.65rem", color: "#666666" }}>Unit</label>
                  <div className="ind-mono p-2" style={{ background: "#f0f0f0", fontSize: "0.85rem" }}>{selectedRate.unit}</div>
                </div>
                <div>
                  <label className="ind-label block mb-1.5" style={{ fontSize: "0.65rem", color: "#666666" }}>Quantity</label>
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={lineForm.quantity}
                    onChange={(e) => setLineForm({ ...lineForm, quantity: e.target.value })}
                    style={{ width: "100%", border: "2px solid #e0e0e0", borderRadius: 0, padding: "0.5rem 0.75rem", fontFamily: "'Space Mono', monospace", fontSize: "0.875rem", outline: "none" }}
                    onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                    onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                  />
                </div>
                <div>
                  <label className="ind-label block mb-1.5" style={{ fontSize: "0.65rem", color: "#666666" }}>
                    Unit Rate (BND) — Range: {parseFloat(String(selectedRate.rateMin)).toFixed(2)} – {parseFloat(String(selectedRate.rateMax)).toFixed(2)}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={lineForm.unitRate}
                    onChange={(e) => setLineForm({ ...lineForm, unitRate: e.target.value })}
                    style={{ width: "100%", border: "2px solid #e0e0e0", borderRadius: 0, padding: "0.5rem 0.75rem", fontFamily: "'Space Mono', monospace", fontSize: "0.875rem", outline: "none" }}
                    onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                    onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                  />
                </div>
              </div>
              {lineForm.quantity && lineForm.unitRate && (
                <div className="mb-4 p-3" style={{ background: "#f0f0f0" }}>
                  <span className="ind-subtext text-gray-500 mr-2">Line Total:</span>
                  <span className="ind-mono font-bold">
                    BND {(parseFloat(lineForm.quantity) * parseFloat(lineForm.unitRate)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                  {parseFloat(lineForm.unitRate) < parseFloat(String(selectedRate.rateMin)) && (
                    <span className="ind-flag-badge ml-3">⚠ Below Minimum</span>
                  )}
                  {parseFloat(lineForm.unitRate) > parseFloat(String(selectedRate.rateMax)) && (
                    <span className="ind-flag-badge ml-3">⚠ Exceeds Maximum</span>
                  )}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleAddLine}
                  disabled={addLineMutation.isPending || !lineForm.quantity || !lineForm.unitRate}
                  className="ind-label px-6 py-2.5"
                  style={{ background: "#1a1a1a", color: "#ffffff", border: "none", fontSize: "0.7rem", cursor: "pointer" }}
                >
                  {addLineMutation.isPending ? "Adding..." : "Add to BOQ →"}
                </button>
                <button
                  onClick={() => setSelectedRate(null)}
                  className="ind-label px-6 py-2.5"
                  style={{ background: "transparent", color: "#666666", border: "2px solid #e0e0e0", fontSize: "0.7rem", cursor: "pointer" }}
                >
                  ← Back to Search
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Line Items Table */}
      <div style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}>
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #e8e8e8" }}>
          <div className="ind-label" style={{ fontSize: "0.72rem", color: "#1a1a1a" }}>Bill of Quantities</div>
          <div className="ind-subtext text-gray-400">{lineItems.length} line items</div>
        </div>
        {lineItems.length === 0 ? (
          <div className="p-12 text-center">
            <div className="ind-label text-gray-400 mb-2" style={{ fontSize: "0.75rem" }}>No Line Items</div>
            <div className="text-gray-400" style={{ fontSize: "0.85rem" }}>Add rate items using the button above or the AI assistant.</div>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table className="ind-table">
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}>#</th>
                    <th style={{ width: "90px" }}>Code</th>
                    <th>Description</th>
                    <th style={{ width: "60px" }}>Unit</th>
                    <th style={{ width: "100px", textAlign: "right" }}>Quantity</th>
                    <th style={{ width: "110px", textAlign: "right" }}>Unit Rate (BND)</th>
                    <th style={{ width: "120px", textAlign: "right" }}>Line Total (BND)</th>
                    <th style={{ width: "80px", textAlign: "center" }}>Status</th>
                    <th style={{ width: "60px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((line, idx) => (
                    <tr key={line.id} className={line.isFlagged ? "ind-flagged" : ""}>
                      <td className="ind-subtext text-gray-400">{idx + 1}</td>
                      <td><span className="ind-mono text-gray-500">{line.itemCode}</span></td>
                      <td>
                        <div style={{ fontSize: "0.85rem", color: "#1a1a1a" }}>{line.description}</div>
                        {line.isFlagged && line.flagReason && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle size={10} style={{ color: "#c0392b" }} />
                            <span style={{ fontSize: "0.7rem", color: "#c0392b" }}>{line.flagReason}</span>
                          </div>
                        )}
                      </td>
                      <td><span className="ind-mono text-gray-500">{line.unit}</span></td>
                      <td style={{ textAlign: "right" }}>
                        {editingLine === line.id ? (
                          <input
                            type="number"
                            value={editValues.quantity}
                            onChange={(e) => setEditValues({ ...editValues, quantity: e.target.value })}
                            style={{ width: "80px", border: "2px solid #1a1a1a", borderRadius: 0, padding: "0.25rem 0.5rem", fontFamily: "'Space Mono', monospace", fontSize: "0.8rem", textAlign: "right" }}
                          />
                        ) : (
                          <span className="ind-mono">{parseFloat(line.quantity as string).toFixed(3)}</span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {editingLine === line.id ? (
                          <input
                            type="number"
                            value={editValues.unitRate}
                            onChange={(e) => setEditValues({ ...editValues, unitRate: e.target.value })}
                            style={{ width: "90px", border: "2px solid #1a1a1a", borderRadius: 0, padding: "0.25rem 0.5rem", fontFamily: "'Space Mono', monospace", fontSize: "0.8rem", textAlign: "right" }}
                          />
                        ) : (
                          <span className="ind-mono">{parseFloat(line.unitRate as string).toFixed(2)}</span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span className="ind-mono font-bold">{parseFloat(line.lineTotal as string).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {line.isFlagged ? (
                          <span className="ind-flag-badge" style={{ fontSize: "0.55rem" }}>⚠</span>
                        ) : (
                          <span style={{ fontSize: "0.65rem", color: "#27ae60", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.05em" }}>✓ OK</span>
                        )}
                      </td>
                      <td>
                        {editingLine === line.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                updateLineMutation.mutate({ id: line.id, estimateId, quantity: editValues.quantity, unitRate: editValues.unitRate });
                              }}
                              style={{ background: "#1a1a1a", border: "none", color: "#ffffff", padding: "0.25rem 0.5rem", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingLine(null)}
                              style={{ background: "transparent", border: "1px solid #e0e0e0", color: "#999999", padding: "0.25rem 0.5rem", cursor: "pointer" }}
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <button
                              onClick={() => { setEditingLine(line.id); setEditValues({ quantity: String(parseFloat(line.quantity as string)), unitRate: String(parseFloat(line.unitRate as string)) }); }}
                              style={{ background: "transparent", border: "none", color: "#cccccc", cursor: "pointer", padding: "0.25rem", fontSize: "0.7rem" }}
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => removeLineMutation.mutate({ id: line.id, estimateId })}
                              style={{ background: "transparent", border: "none", color: "#cccccc", cursor: "pointer", padding: "0.25rem" }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Grand Total */}
            <div className="flex items-center justify-end gap-8 px-5 py-4" style={{ background: "#1a1a1a" }}>
              <div className="ind-subtext text-gray-400">Grand Total (BND)</div>
              <div className="ind-headline text-white" style={{ fontSize: "1.5rem" }}>
                {parseFloat(estimate.grandTotal as string).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Submit */}
      {estimate.status === "draft" && lineItems.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => updateEstimateMutation.mutate({ id: estimateId, status: "submitted" })}
            disabled={updateEstimateMutation.isPending}
            className="ind-label px-8 py-3"
            style={{ background: "#1a1a1a", color: "#ffffff", border: "none", fontSize: "0.75rem", cursor: "pointer" }}
          >
            Submit Estimate →
          </button>
        </div>
      )}
    </AppLayout>
  );
}
