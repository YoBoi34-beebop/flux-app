/**
 * BOGSA Rate Database Seed Script
 * Seeds realistic BOGSA-style engineering rates for Brunei Darussalam
 * Covers: Civil, Mechanical, Electrical, Piping trades
 * Currency: BND (Brunei Dollar)
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const conn = await mysql.createConnection(DB_URL);

async function run() {
  console.log("🔧 Seeding BOGSA Rate Database...\n");

  // ── 1. Create Rate Version ─────────────────────────────────────────────────
  const [versionResult] = await conn.execute(
    `INSERT INTO rate_versions (label, year, status, publishedAt, createdAt, updatedAt)
     VALUES (?, ?, ?, NOW(), NOW(), NOW())
     ON DUPLICATE KEY UPDATE label=label`,
    ["BOGSA 2025", 2025, "published"]
  );
  
  let versionId;
  if (versionResult.insertId && versionResult.insertId > 0) {
    versionId = versionResult.insertId;
    console.log(`✅ Created rate version: BOGSA 2025 (ID: ${versionId})`);
  } else {
    const [rows] = await conn.execute(`SELECT id FROM rate_versions WHERE year = 2025 LIMIT 1`);
    versionId = rows[0].id;
    console.log(`ℹ️  Rate version already exists (ID: ${versionId})`);
  }

  // ── 2. Rate Categories ─────────────────────────────────────────────────────
  const categories = [
    // Civil
    { name: "Earthworks & Site Preparation", code: "CIV-01", trade: "civil", sortOrder: 1 },
    { name: "Concrete Works", code: "CIV-02", trade: "civil", sortOrder: 2 },
    { name: "Structural Steelwork", code: "CIV-03", trade: "civil", sortOrder: 3 },
    { name: "Masonry & Brickwork", code: "CIV-04", trade: "civil", sortOrder: 4 },
    { name: "Roofing & Cladding", code: "CIV-05", trade: "civil", sortOrder: 5 },
    { name: "Roads & Paving", code: "CIV-06", trade: "civil", sortOrder: 6 },
    { name: "Drainage & Culverts", code: "CIV-07", trade: "civil", sortOrder: 7 },
    // Mechanical
    { name: "HVAC Systems", code: "MEC-01", trade: "mechanical", sortOrder: 1 },
    { name: "Pumps & Compressors", code: "MEC-02", trade: "mechanical", sortOrder: 2 },
    { name: "Pressure Vessels & Tanks", code: "MEC-03", trade: "mechanical", sortOrder: 3 },
    { name: "Heat Exchangers", code: "MEC-04", trade: "mechanical", sortOrder: 4 },
    { name: "Rotating Equipment", code: "MEC-05", trade: "mechanical", sortOrder: 5 },
    { name: "Insulation Works", code: "MEC-06", trade: "mechanical", sortOrder: 6 },
    // Electrical
    { name: "Power Distribution", code: "ELE-01", trade: "electrical", sortOrder: 1 },
    { name: "Lighting Systems", code: "ELE-02", trade: "electrical", sortOrder: 2 },
    { name: "Instrumentation & Control", code: "ELE-03", trade: "electrical", sortOrder: 3 },
    { name: "Earthing & Lightning Protection", code: "ELE-04", trade: "electrical", sortOrder: 4 },
    { name: "Cable & Conduit", code: "ELE-05", trade: "electrical", sortOrder: 5 },
    // Piping
    { name: "Process Piping", code: "PIP-01", trade: "piping", sortOrder: 1 },
    { name: "Utility Piping", code: "PIP-02", trade: "piping", sortOrder: 2 },
    { name: "Valves & Fittings", code: "PIP-03", trade: "piping", sortOrder: 3 },
    { name: "Pipe Supports & Hangers", code: "PIP-04", trade: "piping", sortOrder: 4 },
    { name: "Pressure Testing", code: "PIP-05", trade: "piping", sortOrder: 5 },
  ];

  const catIdMap = {};
  for (const cat of categories) {
    const [r] = await conn.execute(
      `INSERT INTO rate_categories (name, code, trade, sortOrder, createdAt)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE name=name`,
      [cat.name, cat.code, cat.trade, cat.sortOrder]
    );
    if (r.insertId && r.insertId > 0) {
      catIdMap[cat.code] = r.insertId;
    } else {
      const [rows] = await conn.execute(`SELECT id FROM rate_categories WHERE code = ? LIMIT 1`, [cat.code]);
      catIdMap[cat.code] = rows[0].id;
    }
  }
  console.log(`✅ Created ${categories.length} rate categories`);

  // ── 3. Rate Items ──────────────────────────────────────────────────────────
  const items = [
    // ── CIVIL: Earthworks ────────────────────────────────────────────────────
    { code: "CIV-01-001", desc: "Bulk excavation in general ground, depth not exceeding 1.5m", unit: "m³", min: 8.50, std: 12.00, max: 16.00, cat: "CIV-01", remarks: "Includes disposal off-site within 5km" },
    { code: "CIV-01-002", desc: "Bulk excavation in hard rock, depth not exceeding 1.5m", unit: "m³", min: 35.00, std: 48.00, max: 65.00, cat: "CIV-01", remarks: "Blasting not included" },
    { code: "CIV-01-003", desc: "Backfilling with selected fill material, compacted in 300mm layers", unit: "m³", min: 12.00, std: 18.00, max: 25.00, cat: "CIV-01" },
    { code: "CIV-01-004", desc: "Grading and levelling of site to formation level", unit: "m²", min: 2.50, std: 4.00, max: 6.00, cat: "CIV-01" },
    { code: "CIV-01-005", desc: "Topsoil stripping and stockpiling, 150mm depth", unit: "m²", min: 1.80, std: 2.80, max: 4.00, cat: "CIV-01" },
    { code: "CIV-01-006", desc: "Dewatering of excavation, including pumping and disposal", unit: "day", min: 180.00, std: 280.00, max: 420.00, cat: "CIV-01" },

    // ── CIVIL: Concrete Works ────────────────────────────────────────────────
    { code: "CIV-02-001", desc: "Plain concrete blinding, C10, 75mm thick", unit: "m²", min: 18.00, std: 25.00, max: 35.00, cat: "CIV-02" },
    { code: "CIV-02-002", desc: "Reinforced concrete, C25, in foundations and bases", unit: "m³", min: 280.00, std: 380.00, max: 480.00, cat: "CIV-02", remarks: "Excludes reinforcement" },
    { code: "CIV-02-003", desc: "Reinforced concrete, C30, in columns", unit: "m³", min: 320.00, std: 420.00, max: 540.00, cat: "CIV-02", remarks: "Excludes reinforcement" },
    { code: "CIV-02-004", desc: "Reinforced concrete, C30, in suspended slabs", unit: "m³", min: 350.00, std: 460.00, max: 580.00, cat: "CIV-02" },
    { code: "CIV-02-005", desc: "High yield steel reinforcement, 10mm–32mm diameter", unit: "tonne", min: 1800.00, std: 2400.00, max: 3200.00, cat: "CIV-02" },
    { code: "CIV-02-006", desc: "Formwork to soffits of slabs, flat", unit: "m²", min: 25.00, std: 38.00, max: 55.00, cat: "CIV-02" },
    { code: "CIV-02-007", desc: "Formwork to sides of beams and columns", unit: "m²", min: 28.00, std: 42.00, max: 60.00, cat: "CIV-02" },

    // ── CIVIL: Structural Steelwork ──────────────────────────────────────────
    { code: "CIV-03-001", desc: "Structural steelwork, fabricated and erected, universal columns", unit: "tonne", min: 3200.00, std: 4500.00, max: 6000.00, cat: "CIV-03", remarks: "Includes primer coat" },
    { code: "CIV-03-002", desc: "Structural steelwork, fabricated and erected, universal beams", unit: "tonne", min: 3000.00, std: 4200.00, max: 5600.00, cat: "CIV-03" },
    { code: "CIV-03-003", desc: "Grating, galvanised steel, 25×3mm bearing bars at 30mm centres", unit: "m²", min: 85.00, std: 120.00, max: 165.00, cat: "CIV-03" },
    { code: "CIV-03-004", desc: "Handrail, galvanised steel, 50mm NB pipe, complete with posts", unit: "m", min: 65.00, std: 95.00, max: 135.00, cat: "CIV-03" },

    // ── CIVIL: Roads & Paving ────────────────────────────────────────────────
    { code: "CIV-06-001", desc: "Asphalt concrete wearing course, 50mm thick, laid and compacted", unit: "m²", min: 22.00, std: 32.00, max: 45.00, cat: "CIV-06" },
    { code: "CIV-06-002", desc: "Crushed aggregate sub-base, 150mm thick, compacted", unit: "m²", min: 12.00, std: 18.00, max: 26.00, cat: "CIV-06" },
    { code: "CIV-06-003", desc: "Concrete kerb and channel, precast, 125×255mm", unit: "m", min: 28.00, std: 42.00, max: 60.00, cat: "CIV-06" },
    { code: "CIV-06-004", desc: "Concrete block paving, 60mm thick, on 50mm sand bed", unit: "m²", min: 35.00, std: 52.00, max: 72.00, cat: "CIV-06" },

    // ── CIVIL: Drainage ──────────────────────────────────────────────────────
    { code: "CIV-07-001", desc: "Precast concrete pipe, 300mm diameter, Class H, including bedding", unit: "m", min: 45.00, std: 68.00, max: 95.00, cat: "CIV-07" },
    { code: "CIV-07-002", desc: "Precast concrete pipe, 600mm diameter, Class H, including bedding", unit: "m", min: 95.00, std: 145.00, max: 200.00, cat: "CIV-07" },
    { code: "CIV-07-003", desc: "Brick manhole, 1050mm internal diameter, depth up to 1.5m", unit: "no.", min: 850.00, std: 1250.00, max: 1800.00, cat: "CIV-07" },

    // ── MECHANICAL: HVAC ─────────────────────────────────────────────────────
    { code: "MEC-01-001", desc: "Supply and install split-type air conditioning unit, 1.5 HP", unit: "no.", min: 850.00, std: 1200.00, max: 1650.00, cat: "MEC-01" },
    { code: "MEC-01-002", desc: "Supply and install split-type air conditioning unit, 2.5 HP", unit: "no.", min: 1200.00, std: 1700.00, max: 2300.00, cat: "MEC-01" },
    { code: "MEC-01-003", desc: "Supply and install packaged air handling unit, 5000 CFM", unit: "no.", min: 8500.00, std: 12000.00, max: 16500.00, cat: "MEC-01" },
    { code: "MEC-01-004", desc: "Galvanised steel ductwork, supply air, up to 300mm wide", unit: "m²", min: 45.00, std: 68.00, max: 95.00, cat: "MEC-01" },
    { code: "MEC-01-005", desc: "Galvanised steel ductwork, supply air, 301–600mm wide", unit: "m²", min: 55.00, std: 82.00, max: 115.00, cat: "MEC-01" },
    { code: "MEC-01-006", desc: "Flexible ductwork connection, 200mm diameter, 500mm long", unit: "no.", min: 25.00, std: 38.00, max: 55.00, cat: "MEC-01" },

    // ── MECHANICAL: Pumps ────────────────────────────────────────────────────
    { code: "MEC-02-001", desc: "Centrifugal pump, horizontal, 50mm suction/discharge, 5 kW motor", unit: "no.", min: 2800.00, std: 4200.00, max: 6000.00, cat: "MEC-02", remarks: "Includes base plate and coupling" },
    { code: "MEC-02-002", desc: "Centrifugal pump, horizontal, 100mm suction/discharge, 15 kW motor", unit: "no.", min: 6500.00, std: 9500.00, max: 13500.00, cat: "MEC-02" },
    { code: "MEC-02-003", desc: "Submersible pump, 50mm discharge, 2.2 kW motor", unit: "no.", min: 1800.00, std: 2800.00, max: 4000.00, cat: "MEC-02" },
    { code: "MEC-02-004", desc: "Reciprocating air compressor, 500 litre receiver, 7.5 kW", unit: "no.", min: 4500.00, std: 6800.00, max: 9500.00, cat: "MEC-02" },

    // ── MECHANICAL: Pressure Vessels ─────────────────────────────────────────
    { code: "MEC-03-001", desc: "Vertical pressure vessel, carbon steel, 1000L capacity, 10 bar", unit: "no.", min: 12000.00, std: 18000.00, max: 26000.00, cat: "MEC-03", remarks: "Excludes nozzles and instrumentation" },
    { code: "MEC-03-002", desc: "Horizontal storage tank, carbon steel, 10,000L, atmospheric", unit: "no.", min: 18000.00, std: 28000.00, max: 40000.00, cat: "MEC-03" },
    { code: "MEC-03-003", desc: "GRP water storage tank, 5,000L, with fittings", unit: "no.", min: 6500.00, std: 9500.00, max: 13500.00, cat: "MEC-03" },

    // ── MECHANICAL: Insulation ───────────────────────────────────────────────
    { code: "MEC-06-001", desc: "Mineral wool pipe insulation, 25mm thick, 50mm NB pipe", unit: "m", min: 18.00, std: 28.00, max: 40.00, cat: "MEC-06", remarks: "Includes aluminium cladding" },
    { code: "MEC-06-002", desc: "Mineral wool pipe insulation, 50mm thick, 100mm NB pipe", unit: "m", min: 32.00, std: 48.00, max: 68.00, cat: "MEC-06" },
    { code: "MEC-06-003", desc: "Mineral wool slab insulation, 50mm thick, on flat surfaces", unit: "m²", min: 28.00, std: 42.00, max: 60.00, cat: "MEC-06" },
    { code: "MEC-06-004", desc: "Calcium silicate pipe insulation, 50mm thick, 150mm NB pipe, hot service", unit: "m", min: 55.00, std: 82.00, max: 115.00, cat: "MEC-06" },

    // ── ELECTRICAL: Power Distribution ───────────────────────────────────────
    { code: "ELE-01-001", desc: "Main distribution board, 4-way, 100A TPN, IP54 enclosure", unit: "no.", min: 1800.00, std: 2800.00, max: 4000.00, cat: "ELE-01" },
    { code: "ELE-01-002", desc: "Sub-distribution board, 8-way, 63A TPN, IP54 enclosure", unit: "no.", min: 1200.00, std: 1800.00, max: 2600.00, cat: "ELE-01" },
    { code: "ELE-01-003", desc: "Motor control centre, 4 starters, up to 22 kW each, IP54", unit: "no.", min: 18000.00, std: 28000.00, max: 40000.00, cat: "ELE-01" },
    { code: "ELE-01-004", desc: "Transformer, 11kV/415V, 500 kVA, oil-cooled, outdoor", unit: "no.", min: 45000.00, std: 68000.00, max: 95000.00, cat: "ELE-01" },

    // ── ELECTRICAL: Lighting ─────────────────────────────────────────────────
    { code: "ELE-02-001", desc: "LED fluorescent luminaire, 2×36W, surface mounted, IP20", unit: "no.", min: 85.00, std: 130.00, max: 185.00, cat: "ELE-02" },
    { code: "ELE-02-002", desc: "LED high bay luminaire, 150W, IP65, for industrial use", unit: "no.", min: 280.00, std: 420.00, max: 600.00, cat: "ELE-02" },
    { code: "ELE-02-003", desc: "LED street light, 80W, on 6m galvanised steel pole", unit: "no.", min: 850.00, std: 1300.00, max: 1850.00, cat: "ELE-02" },
    { code: "ELE-02-004", desc: "Emergency exit luminaire, maintained, 3-hour battery backup", unit: "no.", min: 180.00, std: 280.00, max: 400.00, cat: "ELE-02" },

    // ── ELECTRICAL: Instrumentation ──────────────────────────────────────────
    { code: "ELE-03-001", desc: "Pressure transmitter, 4-20mA, 0-100 bar, HART protocol", unit: "no.", min: 1200.00, std: 1800.00, max: 2600.00, cat: "ELE-03" },
    { code: "ELE-03-002", desc: "Temperature transmitter, 4-20mA, PT100 sensor, HART protocol", unit: "no.", min: 950.00, std: 1450.00, max: 2100.00, cat: "ELE-03" },
    { code: "ELE-03-003", desc: "Flow meter, magnetic, 100mm NB, 4-20mA output", unit: "no.", min: 3500.00, std: 5500.00, max: 8000.00, cat: "ELE-03" },
    { code: "ELE-03-004", desc: "Level transmitter, guided wave radar, 4-20mA, HART", unit: "no.", min: 2800.00, std: 4200.00, max: 6000.00, cat: "ELE-03" },
    { code: "ELE-03-005", desc: "PLC panel, 16 DI/16 DO, 8 AI/4 AO, including programming", unit: "no.", min: 12000.00, std: 18000.00, max: 26000.00, cat: "ELE-03" },

    // ── ELECTRICAL: Cable & Conduit ──────────────────────────────────────────
    { code: "ELE-05-001", desc: "PVC insulated cable, 2.5mm², 3-core, in conduit", unit: "m", min: 4.50, std: 7.00, max: 10.00, cat: "ELE-05" },
    { code: "ELE-05-002", desc: "XLPE armoured cable, 16mm², 3-core, direct buried", unit: "m", min: 22.00, std: 34.00, max: 48.00, cat: "ELE-05" },
    { code: "ELE-05-003", desc: "XLPE armoured cable, 95mm², 3-core, direct buried", unit: "m", min: 65.00, std: 98.00, max: 140.00, cat: "ELE-05" },
    { code: "ELE-05-004", desc: "GI conduit, 25mm diameter, surface mounted", unit: "m", min: 8.50, std: 13.00, max: 18.50, cat: "ELE-05" },
    { code: "ELE-05-005", desc: "Cable tray, hot-dip galvanised, 150mm wide, including supports", unit: "m", min: 28.00, std: 42.00, max: 60.00, cat: "ELE-05" },

    // ── PIPING: Process Piping ───────────────────────────────────────────────
    { code: "PIP-01-001", desc: "Carbon steel pipe, seamless, 2-inch NB, Sch 40, ASTM A106 Gr.B, erected", unit: "m", min: 55.00, std: 82.00, max: 115.00, cat: "PIP-01", remarks: "Excludes insulation and painting" },
    { code: "PIP-01-002", desc: "Carbon steel pipe, seamless, 4-inch NB, Sch 40, ASTM A106 Gr.B, erected", unit: "m", min: 95.00, std: 145.00, max: 200.00, cat: "PIP-01" },
    { code: "PIP-01-003", desc: "Carbon steel pipe, seamless, 6-inch NB, Sch 40, ASTM A106 Gr.B, erected", unit: "m", min: 145.00, std: 220.00, max: 310.00, cat: "PIP-01" },
    { code: "PIP-01-004", desc: "Carbon steel pipe, seamless, 8-inch NB, Sch 40, ASTM A106 Gr.B, erected", unit: "m", min: 195.00, std: 295.00, max: 415.00, cat: "PIP-01" },
    { code: "PIP-01-005", desc: "Stainless steel pipe, 316L, 2-inch NB, Sch 10S, erected", unit: "m", min: 120.00, std: 180.00, max: 255.00, cat: "PIP-01" },
    { code: "PIP-01-006", desc: "Stainless steel pipe, 316L, 4-inch NB, Sch 10S, erected", unit: "m", min: 220.00, std: 330.00, max: 465.00, cat: "PIP-01" },
    { code: "PIP-01-007", desc: "Butt weld fitting, carbon steel, 2-inch, 90° elbow, Sch 40", unit: "no.", min: 28.00, std: 42.00, max: 60.00, cat: "PIP-01" },
    { code: "PIP-01-008", desc: "Butt weld fitting, carbon steel, 4-inch, 90° elbow, Sch 40", unit: "no.", min: 55.00, std: 82.00, max: 115.00, cat: "PIP-01" },
    { code: "PIP-01-009", desc: "Butt weld fitting, carbon steel, 6-inch, tee equal, Sch 40", unit: "no.", min: 95.00, std: 145.00, max: 200.00, cat: "PIP-01" },
    { code: "PIP-01-010", desc: "Flanged connection, carbon steel, 4-inch, ANSI 150#, including gasket and bolts", unit: "no.", min: 85.00, std: 130.00, max: 185.00, cat: "PIP-01" },
    { code: "PIP-01-011", desc: "Flanged connection, carbon steel, 6-inch, ANSI 150#, including gasket and bolts", unit: "no.", min: 120.00, std: 180.00, max: 255.00, cat: "PIP-01" },

    // ── PIPING: Utility Piping ───────────────────────────────────────────────
    { code: "PIP-02-001", desc: "GI pipe, medium grade, 1-inch NB, including fittings, erected", unit: "m", min: 18.00, std: 28.00, max: 40.00, cat: "PIP-02" },
    { code: "PIP-02-002", desc: "GI pipe, medium grade, 2-inch NB, including fittings, erected", unit: "m", min: 28.00, std: 42.00, max: 60.00, cat: "PIP-02" },
    { code: "PIP-02-003", desc: "uPVC pipe, Class E, 100mm diameter, including fittings, buried", unit: "m", min: 22.00, std: 34.00, max: 48.00, cat: "PIP-02" },
    { code: "PIP-02-004", desc: "uPVC pipe, Class E, 200mm diameter, including fittings, buried", unit: "m", min: 42.00, std: 65.00, max: 92.00, cat: "PIP-02" },
    { code: "PIP-02-005", desc: "Copper pipe, 22mm OD, Type B, including fittings, erected", unit: "m", min: 32.00, std: 48.00, max: 68.00, cat: "PIP-02" },

    // ── PIPING: Valves & Fittings ────────────────────────────────────────────
    { code: "PIP-03-001", desc: "Gate valve, carbon steel, flanged, 2-inch, ANSI 150#", unit: "no.", min: 280.00, std: 420.00, max: 600.00, cat: "PIP-03" },
    { code: "PIP-03-002", desc: "Gate valve, carbon steel, flanged, 4-inch, ANSI 150#", unit: "no.", min: 550.00, std: 820.00, max: 1150.00, cat: "PIP-03" },
    { code: "PIP-03-003", desc: "Ball valve, carbon steel, flanged, 2-inch, ANSI 150#", unit: "no.", min: 320.00, std: 480.00, max: 680.00, cat: "PIP-03" },
    { code: "PIP-03-004", desc: "Ball valve, carbon steel, flanged, 4-inch, ANSI 150#", unit: "no.", min: 650.00, std: 980.00, max: 1380.00, cat: "PIP-03" },
    { code: "PIP-03-005", desc: "Check valve, swing type, carbon steel, flanged, 2-inch, ANSI 150#", unit: "no.", min: 250.00, std: 380.00, max: 540.00, cat: "PIP-03" },
    { code: "PIP-03-006", desc: "Control valve, globe type, pneumatic actuator, 2-inch, ANSI 150#", unit: "no.", min: 3500.00, std: 5500.00, max: 8000.00, cat: "PIP-03" },
    { code: "PIP-03-007", desc: "Safety relief valve, spring loaded, 2-inch, set pressure 10 bar", unit: "no.", min: 850.00, std: 1300.00, max: 1850.00, cat: "PIP-03" },

    // ── PIPING: Pipe Supports ────────────────────────────────────────────────
    { code: "PIP-04-001", desc: "Pipe clamp support, carbon steel, 2-inch NB, including U-bolt", unit: "no.", min: 18.00, std: 28.00, max: 40.00, cat: "PIP-04" },
    { code: "PIP-04-002", desc: "Pipe clamp support, carbon steel, 4-inch NB, including U-bolt", unit: "no.", min: 28.00, std: 42.00, max: 60.00, cat: "PIP-04" },
    { code: "PIP-04-003", desc: "Pipe shoe support, carbon steel, 6-inch NB, welded type", unit: "no.", min: 65.00, std: 98.00, max: 140.00, cat: "PIP-04" },
    { code: "PIP-04-004", desc: "Spring hanger, variable type, 2-inch NB, load capacity 500 kg", unit: "no.", min: 280.00, std: 420.00, max: 600.00, cat: "PIP-04" },

    // ── PIPING: Pressure Testing ─────────────────────────────────────────────
    { code: "PIP-05-001", desc: "Hydrostatic pressure test, 2-inch to 4-inch pipe, per test", unit: "no.", min: 180.00, std: 280.00, max: 400.00, cat: "PIP-05", remarks: "Includes test pump, gauges and documentation" },
    { code: "PIP-05-002", desc: "Hydrostatic pressure test, 6-inch to 10-inch pipe, per test", unit: "no.", min: 320.00, std: 480.00, max: 680.00, cat: "PIP-05" },
    { code: "PIP-05-003", desc: "Pneumatic leak test, 2-inch to 4-inch pipe, per test", unit: "no.", min: 220.00, std: 340.00, max: 480.00, cat: "PIP-05" },
    { code: "PIP-05-004", desc: "Flushing and cleaning of pipeline, 4-inch NB, per 100m", unit: "no.", min: 280.00, std: 420.00, max: 600.00, cat: "PIP-05" },
  ];

  let itemCount = 0;
  for (const item of items) {
    const catId = catIdMap[item.cat];
    if (!catId) {
      console.warn(`⚠️  Category not found: ${item.cat}`);
      continue;
    }
    await conn.execute(
      `INSERT INTO rate_items (versionId, categoryId, code, description, unit, rateMin, rateStandard, rateMax, remarks, isActive, sortOrder, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW())
       ON DUPLICATE KEY UPDATE description=description`,
      [versionId, catId, item.code, item.desc, item.unit, item.min.toFixed(2), item.std.toFixed(2), item.max.toFixed(2), item.remarks ?? null]
    );
    itemCount++;
  }
  console.log(`✅ Created ${itemCount} rate items`);

  await conn.end();
  console.log("\n🎉 BOGSA seed complete!");
  console.log(`   Version: BOGSA 2025 (ID: ${versionId})`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Rate Items: ${itemCount}`);
  console.log(`   Trades: Civil, Mechanical, Electrical, Piping`);
  console.log(`   Currency: BND (Brunei Dollar)\n`);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
