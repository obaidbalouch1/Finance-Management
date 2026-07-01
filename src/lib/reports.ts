import ExcelJS from "exceljs"
import { jsPDF } from "jspdf"
import { autoTable } from "jspdf-autotable"
import Papa from "papaparse"

export type ReportColumn = {
  key: string
  header: string
  width?: number
}

export function generateCsv(columns: ReportColumn[], rows: Record<string, unknown>[]) {
  const data = rows.map((row) =>
    Object.fromEntries(columns.map((c) => [c.header, row[c.key] ?? ""]))
  )
  return Papa.unparse(data)
}

export async function generateExcelBuffer(options: {
  title: string
  columns: ReportColumn[]
  rows: Record<string, unknown>[]
  sheetName?: string
}) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = "Finance Manager"
  workbook.created = new Date()

  const sheet = workbook.addWorksheet(options.sheetName ?? "Report")

  sheet.columns = options.columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.width ?? 20,
  }))

  sheet.getRow(1).font = { bold: true }
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF6366F1" },
  }
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }

  for (const row of options.rows) {
    sheet.addRow(row)
  }

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: options.columns.length },
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

export function generatePdfBuffer(options: {
  title: string
  subtitle?: string
  summary?: { label: string; value: string }[]
  columns: ReportColumn[]
  rows: Record<string, unknown>[]
}) {
  const doc = new jsPDF({ orientation: "landscape" })

  doc.setFontSize(18)
  doc.text(options.title, 14, 18)

  if (options.subtitle) {
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(options.subtitle, 14, 25)
  }

  let startY = 32

  if (options.summary?.length) {
    doc.setFontSize(10)
    doc.setTextColor(30)
    const summaryText = options.summary
      .map((s) => `${s.label}: ${s.value}`)
      .join("      ")
    doc.text(summaryText, 14, startY)
    startY += 8
  }

  autoTable(doc, {
    startY,
    head: [options.columns.map((c) => c.header)],
    body: options.rows.map((row) => options.columns.map((c) => String(row[c.key] ?? ""))),
    headStyles: { fillColor: [99, 102, 241] },
    styles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 245, 250] },
  })

  return Buffer.from(doc.output("arraybuffer"))
}

export function contentTypeFor(format: "csv" | "xlsx" | "pdf") {
  if (format === "csv") return "text/csv"
  if (format === "xlsx")
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  return "application/pdf"
}
