import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useSearch } from "wouter";

const TRADES = ["all", "civil", "mechanical", "electrical", "piping"] as const;
type Trade = (typeof TRADES)[number];

export default function RateDatabase() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const initialTrade = (params.get("trade") as Trade) ?? "all";

  const [trade, setTrade] = useState<Trade>(initialTrade);
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();

  const { data: categories } = trpc.rateCategories.list.useQuery();
  const { data: publishedVersion } = trpc.rateVersions.getPublished.useQuery();
  const { data: items, isLoading } = trpc.rateItems.list.useQuery({
    trade: trade === "all" ? undefined : trade,
    categoryId: selectedCategoryId,
    search: search || undefined,
    limit: 200,
  });

  const filteredCategories = categories?.filter((c) => trade === "all" || c.trade === trade) ?? [];

  return (
    <AppLayout title="Rate Database" subtitle={publishedVersion ? `BOGSA ${publishedVersion.label}` : "Rate Database"}>
      {/* Filter Bar */}
      <div className="flex items-center gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#999999" }} />
          <input
            type="text"
            placeholder="Search rate items by description or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              border: "2px solid #e0e0e0",
              borderRadius: 0,
              padding: "0.6rem 0.75rem 0.6rem 2.25rem",
              fontFamily: "'Barlow', sans-serif",
              fontSize: "0.875rem",
              background: "white",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
            onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
          />
        </div>

        {/* Trade Tabs */}
        <div className="flex">
          {TRADES.map((t) => (
            <button
              key={t}
              onClick={() => { setTrade(t); setSelectedCategoryId(undefined); }}
              style={{
                padding: "0.6rem 1rem",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontSize: "0.7rem",
                background: trade === t ? "#1a1a1a" : "#ffffff",
                color: trade === t ? "#ffffff" : "#666666",
                border: "2px solid",
                borderColor: trade === t ? "#1a1a1a" : "#e0e0e0",
                borderRight: t !== "piping" ? "none" : "2px solid",
                cursor: "pointer",
                transition: "all 0.1s ease",
              }}
            >
              {t === "all" ? "All Trades" : t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Category Sidebar */}
        <div style={{ width: "200px", flexShrink: 0 }}>
          <div className="ind-label mb-3" style={{ fontSize: "0.65rem", color: "#999999" }}>Categories</div>
          <button
            onClick={() => setSelectedCategoryId(undefined)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "0.5rem 0.75rem",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontSize: "0.7rem",
              background: !selectedCategoryId ? "#1a1a1a" : "transparent",
              color: !selectedCategoryId ? "#ffffff" : "#666666",
              border: "none",
              cursor: "pointer",
              marginBottom: "0.25rem",
            }}
          >
            All Categories
          </button>
          {filteredCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "0.5rem 0.75rem",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontSize: "0.7rem",
                background: selectedCategoryId === cat.id ? "#1a1a1a" : "transparent",
                color: selectedCategoryId === cat.id ? "#ffffff" : "#666666",
                border: "none",
                cursor: "pointer",
                marginBottom: "0.25rem",
                borderLeft: `2px solid ${selectedCategoryId === cat.id ? "#ffffff" : "transparent"}`,
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Rate Items Table */}
        <div className="flex-1 min-w-0">
          {!publishedVersion ? (
            <div className="p-10 text-center" style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}>
              <div className="ind-label text-gray-400 mb-2" style={{ fontSize: "0.75rem" }}>No Published Rate Version</div>
              <div className="text-gray-400" style={{ fontSize: "0.85rem" }}>An administrator must publish a rate version before rates are visible.</div>
            </div>
          ) : isLoading ? (
            <div className="p-10 text-center" style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}>
              <div className="ind-subtext text-gray-400">Loading rates...</div>
            </div>
          ) : !items || items.length === 0 ? (
            <div className="p-10 text-center" style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}>
              <div className="ind-label text-gray-400 mb-2" style={{ fontSize: "0.75rem" }}>No Rate Items Found</div>
              <div className="text-gray-400" style={{ fontSize: "0.85rem" }}>Try adjusting your search or filter criteria.</div>
            </div>
          ) : (
            <div style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #e8e8e8" }}>
                <div className="ind-subtext text-gray-400">{items.length} rate items</div>
                <div className="ind-subtext text-gray-400">{publishedVersion.label}</div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="ind-table">
                  <thead>
                    <tr>
                      <th style={{ width: "90px" }}>Code</th>
                      <th>Description</th>
                      <th style={{ width: "80px" }}>Trade</th>
                      <th style={{ width: "60px" }}>Unit</th>
                      <th style={{ width: "100px", textAlign: "right" }}>Min (BND)</th>
                      <th style={{ width: "110px", textAlign: "right" }}>Standard (BND)</th>
                      <th style={{ width: "100px", textAlign: "right" }}>Max (BND)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <span className="ind-mono" style={{ color: "#666666" }}>{item.code}</span>
                        </td>
                        <td>
                          <div style={{ fontSize: "0.85rem", color: "#1a1a1a" }}>{item.description}</div>
                          {item.remarks && (
                            <div className="ind-subtext text-gray-400 mt-0.5">{item.remarks}</div>
                          )}
                        </td>
                        <td>
                          <span className={`trade-badge trade-${item.category?.trade ?? "civil"}`}>
                            {item.category?.trade ?? "—"}
                          </span>
                        </td>
                        <td>
                          <span className="ind-mono text-gray-500">{item.unit}</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span className="ind-mono">{parseFloat(item.rateMin as string).toFixed(2)}</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span className="ind-mono font-bold">{parseFloat(item.rateStandard as string).toFixed(2)}</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span className="ind-mono">{parseFloat(item.rateMax as string).toFixed(2)}</span>
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
