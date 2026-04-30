# Brunei Engineering Rate Database — TODO

## Schema & Backend
- [x] Database schema: contractor_profiles, rate_categories, rate_items, rate_versions, boq_estimates, boq_line_items
- [x] Drizzle migration generated and applied
- [x] tRPC router: contractors (profile CRUD, CIDB/OGPC fields)
- [x] tRPC router: rates (list, search, filter by category/trade/unit)
- [x] tRPC router: rateVersions (admin publish/approve annual updates)
- [x] tRPC router: boq (create estimate, add/remove line items, auto-calculate totals)
- [x] tRPC router: ai (describe scope → matching BOGSA rate items)
- [x] PDF generation endpoint: /api/boq/:id/pdf (pdfkit, formatted A4 BOQ)
- [x] Rate range validation logic (flag items outside min/max with reason messages)
- [x] Role-based access: admin vs contractor procedures (adminProcedure guard)
- [x] Seed BOGSA 2025 rate data: 90 items across 23 categories (civil, mechanical, electrical, piping)

## Frontend — Design System
- [x] Industrial grayscale CSS variables and typography (Barlow Condensed + Space Mono)
- [x] AppLayout with sidebar navigation for industrial aesthetic
- [x] Consistent ind-label, ind-headline, ind-subtext, ind-mono utility classes

## Frontend — Pages
- [x] Landing page with industrial geometric hero and feature sections
- [x] Login / OAuth flow (Manus OAuth)
- [x] Contractor profile setup (CIDB/OGPC credentials, approval status)
- [x] Rate database browser (search, filter by trade/category, rate range display)
- [x] BOQ estimation form (item selection, quantity input, auto-total, validation flags)
- [x] My Estimates list page with status badges
- [x] BOQ Detail page with line items, AI assistant panel, PDF export
- [x] Admin: rate database management (versions, categories, rate items CRUD)
- [x] Admin: contractor management (approve/revoke)
- [x] Admin: dashboard overview with stats
- [x] AI assistant panel (plain English → matching rate items → add to BOQ)

## Quality
- [x] 30 Vitest tests passing: auth, admin guard, protected procedures, rate validation, BOQ calculation, public procedures, input validation
