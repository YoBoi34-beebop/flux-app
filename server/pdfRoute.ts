import { Router, Request, Response } from "express";
import PDFDocument from "pdfkit";
import { getBOQEstimateById, getBOQLineItems, getContractorProfile } from "./db";
import { sdk } from "./_core/sdk";

const pdfRouter = Router();

pdfRouter.get("/api/boq/:id/pdf", async (req: Request, res: Response) => {
  try {
    // Verify session
    const user = await sdk.authenticateRequest(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const estimateId = parseInt(req.params.id);
    if (isNaN(estimateId)) {
      res.status(400).json({ error: "Invalid estimate ID" });
      return;
    }

    const estimate = await getBOQEstimateById(estimateId);
    if (!estimate) {
      res.status(404).json({ error: "Estimate not found" });
      return;
    }

    // Ownership check (admin can view all)
    if (user.role !== "admin" && estimate.userId !== user.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const lineItems = await getBOQLineItems(estimateId);
    const profile = await getContractorProfile(estimate.userId);

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="BOQ-${estimate.projectRef ?? estimateId}.pdf"`
    );

    doc.pipe(res);

    // ── Header ────────────────────────────────────────────────────────────────
    // Dark header block
    doc.rect(50, 50, 495, 70).fill("#1a1a1a");

    doc.fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("BILL OF QUANTITIES", 65, 65, { characterSpacing: 2 });

    doc.fillColor("#888888")
      .font("Helvetica")
      .fontSize(8)
      .text("BOGSA RATE DATABASE · BRUNEI DARUSSALAM", 65, 92, { characterSpacing: 1.5 });

    // ── Project Info ──────────────────────────────────────────────────────────
    doc.fillColor("#1a1a1a").font("Helvetica-Bold").fontSize(11).text(estimate.projectName, 50, 140);

    const infoY = 158;
    const col1 = 50, col2 = 200, col3 = 370;

    doc.fillColor("#999999").font("Helvetica").fontSize(7);
    doc.text("PROJECT REFERENCE", col1, infoY);
    doc.text("CLIENT", col2, infoY);
    doc.text("LOCATION", col3, infoY);

    doc.fillColor("#1a1a1a").font("Helvetica").fontSize(9);
    doc.text(estimate.projectRef ?? "—", col1, infoY + 12);
    doc.text(estimate.clientName ?? "—", col2, infoY + 12);
    doc.text(estimate.projectLocation ?? "—", col3, infoY + 12);

    // Divider
    doc.moveTo(50, infoY + 30).lineTo(545, infoY + 30).strokeColor("#e0e0e0").lineWidth(1).stroke();

    // ── Contractor Info ───────────────────────────────────────────────────────
    const contY = infoY + 40;
    doc.fillColor("#999999").font("Helvetica").fontSize(7);
    doc.text("CONTRACTOR", col1, contY);
    doc.text("CIDB NO.", col2, contY);
    doc.text("OGPC NO.", col3, contY);

    doc.fillColor("#1a1a1a").font("Helvetica").fontSize(9);
    doc.text(profile?.companyName ?? "—", col1, contY + 12);
    doc.text(profile?.cidbNumber ?? "—", col2, contY + 12);
    doc.text(profile?.ogpcNumber ?? "—", col3, contY + 12);

    // Divider
    doc.moveTo(50, contY + 30).lineTo(545, contY + 30).strokeColor("#e0e0e0").lineWidth(1).stroke();

    // ── Table Header ──────────────────────────────────────────────────────────
    const tableStartY = contY + 42;
    doc.rect(50, tableStartY, 495, 20).fill("#1a1a1a");

    const cols = {
      no: 50, code: 70, desc: 145, unit: 345, qty: 380, rate: 430, total: 490,
    };

    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(7);
    doc.text("NO.", cols.no + 2, tableStartY + 6);
    doc.text("CODE", cols.code + 2, tableStartY + 6);
    doc.text("DESCRIPTION", cols.desc + 2, tableStartY + 6);
    doc.text("UNIT", cols.unit + 2, tableStartY + 6);
    doc.text("QTY", cols.qty + 2, tableStartY + 6, { width: 45, align: "right" });
    doc.text("RATE (BND)", cols.rate + 2, tableStartY + 6, { width: 55, align: "right" });
    doc.text("TOTAL (BND)", cols.total - 5, tableStartY + 6, { width: 60, align: "right" });

    // ── Table Rows ────────────────────────────────────────────────────────────
    let y = tableStartY + 22;
    const rowHeight = 18;
    const pageBottomMargin = 720;

    lineItems.forEach((line, idx) => {
      // Page break
      if (y + rowHeight > pageBottomMargin) {
        doc.addPage();
        y = 50;
        // Repeat header
        doc.rect(50, y, 495, 20).fill("#1a1a1a");
        doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(7);
        doc.text("NO.", cols.no + 2, y + 6);
        doc.text("CODE", cols.code + 2, y + 6);
        doc.text("DESCRIPTION", cols.desc + 2, y + 6);
        doc.text("UNIT", cols.unit + 2, y + 6);
        doc.text("QTY", cols.qty + 2, y + 6, { width: 45, align: "right" });
        doc.text("RATE (BND)", cols.rate + 2, y + 6, { width: 55, align: "right" });
        doc.text("TOTAL (BND)", cols.total - 5, y + 6, { width: 60, align: "right" });
        y += 22;
      }

      // Alternating row background
      if (idx % 2 === 0) {
        doc.rect(50, y, 495, rowHeight).fill("#fafafa");
      }

      // Flag row
      if (line.isFlagged) {
        doc.rect(50, y, 3, rowHeight).fill("#c0392b");
      }

      const textY = y + 5;
      doc.fillColor(line.isFlagged ? "#c0392b" : "#1a1a1a").font("Helvetica").fontSize(8);

      doc.text(String(idx + 1), cols.no + 2, textY);
      doc.text(line.itemCode ?? "—", cols.code + 2, textY);

      // Description (truncate if too long)
      const descText = line.description.length > 45 ? line.description.slice(0, 44) + "…" : line.description;
      doc.text(descText, cols.desc + 2, textY, { width: 195 });

      doc.text(line.unit, cols.unit + 2, textY);
      doc.text(parseFloat(line.quantity as string).toFixed(2), cols.qty + 2, textY, { width: 45, align: "right" });
      doc.text(parseFloat(line.unitRate as string).toFixed(2), cols.rate + 2, textY, { width: 55, align: "right" });
      doc.text(parseFloat(line.lineTotal as string).toLocaleString("en-US", { minimumFractionDigits: 2 }), cols.total - 5, textY, { width: 60, align: "right" });

      // Row border
      doc.moveTo(50, y + rowHeight).lineTo(545, y + rowHeight).strokeColor("#eeeeee").lineWidth(0.5).stroke();

      y += rowHeight;
    });

    // ── Grand Total ───────────────────────────────────────────────────────────
    y += 8;
    doc.rect(50, y, 495, 24).fill("#1a1a1a");
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10);
    doc.text("GRAND TOTAL (BND)", 55, y + 7);
    doc.text(
      parseFloat(estimate.grandTotal as string).toLocaleString("en-US", { minimumFractionDigits: 2 }),
      cols.total - 5,
      y + 7,
      { width: 60, align: "right" }
    );

    // ── Validation Flags Notice ───────────────────────────────────────────────
    const flaggedLines = lineItems.filter((l) => l.isFlagged);
    if (flaggedLines.length > 0) {
      y += 36;
      doc.rect(50, y, 495, 14).fill("#fdf2f2");
      doc.rect(50, y, 3, 14).fill("#c0392b");
      doc.fillColor("#c0392b").font("Helvetica-Bold").fontSize(7);
      doc.text(
        `⚠  ${flaggedLines.length} line item(s) flagged: rates outside BOGSA acceptable range. Review before submission.`,
        58,
        y + 4
      );
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    const footerY = 790;
    doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor("#e0e0e0").lineWidth(0.5).stroke();
    doc.fillColor("#999999").font("Helvetica").fontSize(7);
    doc.text(
      `Generated by BOGSA Rate Database · Brunei Darussalam · ${new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}`,
      50,
      footerY + 6
    );
    doc.text(
      `Status: ${estimate.status.toUpperCase()}`,
      50,
      footerY + 6,
      { align: "right", width: 495 }
    );

    doc.end();
  } catch (error) {
    console.error("[PDF] Error generating PDF:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "PDF generation failed" });
    }
  }
});

export { pdfRouter };
