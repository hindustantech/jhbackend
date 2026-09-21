import { parse } from "csv-parse/sync";
import xlsx from "xlsx";
import Bill from "../models/billSchema.js";
import { logger } from "../config/logger.js";

function normalizePhone(phone) {
    if (!phone) return "";
    let cleaned = String(phone).replace(/[\s\-()]/g, "");
    if (cleaned.endsWith(".0")) cleaned = cleaned.slice(0, -2);
    if (!cleaned.startsWith("+91") && cleaned.length === 10) cleaned = "+91" + cleaned;
    if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
    return cleaned;
}

function parseDate(value) {
    if (!value) return new Date();
    if (value instanceof Date) return value;
    const str = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) return new Date(str);
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
        const [d, m, y] = str.split("/");
        return new Date(`${y}-${m}-${d}`);
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
        const [d, m, y] = str.split("-");
        return new Date(`${y}-${m}-${d}`);
    }
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function parseCSV(buffer) {
    return parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
        bom: true
    });
}

export function parseExcel(buffer) {
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet);
}

function validateRecord(record, index) {
    const errors = [];
    const customerName = record.customerName || record["Customer Name"] || record["customer_name"] || record.name || "";
    const phoneNo = record.phoneNo || record["Phone No"] || record["Phone"] || record.phone || record["Phone Number"] || "";
    const serviceName = record.serviceName || record["Service Name"] || record["Service"] || record.service || record["ServiceType"] || "";
    const amount = record.amount || record["Amount"] || record["Total"] || record.total || record.price || record["Price"] || "";
    const billDate = record.billDate || record["Bill Date"] || record["Date"] || record.date || record["Invoice Date"] || "";
    const status = record.status || record["Status"] || "pending";

    if (!customerName) errors.push("Missing customerName");
    if (!phoneNo) errors.push("Missing phoneNo");
    if (!serviceName) errors.push("Missing serviceName");
    if (!amount || isNaN(parseFloat(amount))) errors.push("Invalid amount");

    return {
        errors,
        normalized: {
            customerName: String(customerName).trim(),
            phoneNo: normalizePhone(phoneNo),
            serviceName: String(serviceName).trim(),
            amount: parseFloat(amount) || 0,
            billDate: parseDate(billDate),
            status: ["pending", "paid", "overdue", "cancelled"].includes(status) ? status : "pending"
        }
    };
}

export async function processImport(records) {
    const validRecords = [];
    const rowErrors = [];

    records.forEach((record, index) => {
        const { errors, normalized } = validateRecord(record, index);
        if (errors.length === 0) {
            const billId = `BILL-${Date.now()}-${String(index + 1).padStart(4, "0")}`;
            validRecords.push({ billId, ...normalized });
        } else {
            rowErrors.push({ row: index + 1, data: record, errors });
        }
    });

    let inserted = [];
    if (validRecords.length > 0) {
        inserted = await Bill.insertMany(validRecords, { ordered: false }).catch((err) => {
            if (err.insertedDocs && err.insertedDocs.length > 0) {
                return err.insertedDocs;
            }
            logger.error("Bulk insert error:", err);
            return [];
        });
    }

    return {
        totalRecords: records.length,
        imported: inserted.length,
        failed: rowErrors.length,
        errors: rowErrors
    };
}
